import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { CarFormFields } from '../../../components/CarFormFields'
import { CarImageUploader, type ImageItemProps } from '../../../components/CarImageUploader'
import { Container } from '../../../components/Container'
import { DashboardHeader } from '../../../components/DashboardHeader'
import { useAuth } from '../../../hooks/useAuth'
import { carSchema, type CarFormData } from '../../../schemas/car'
import { db, storage } from '../../../services/firebaseConnection'

export function New() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormData>({ resolver: zodResolver(carSchema), mode: 'onChange' })

  const [images, setImages] = useState<ImageItemProps[]>([])
  const [uploadingIds, setUploadingIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  async function uploadImage(file: File) {
    if (!user) return

    const uid = crypto.randomUUID()
    const previewUrl = URL.createObjectURL(file)

    setImages((prev) => [...prev, { uid, name: uid, previewUrl, url: '' }])
    setUploadingIds((prev) => [...prev, uid])

    try {
      const storageRef = ref(storage, `images/${user.uid}/${uid}`)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)

      setImages((prev) => prev.map((image) => (image.uid === uid ? { ...image, url: downloadUrl } : image)))
    } catch {
      setImages((prev) => prev.filter((image) => image.uid !== uid))
      alert('Erro ao enviar imagem. Tente novamente.')
    } finally {
      setUploadingIds((prev) => prev.filter((id) => id !== uid))
    }
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return

    Array.from(fileList)
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => uploadImage(file))
  }

  async function handleRemoveImage(image: ImageItemProps) {
    if (!user) return

    try {
      if (image.url) {
        await deleteObject(ref(storage, `images/${user.uid}/${image.name}`))
      }
      setImages((prev) => prev.filter((item) => item.uid !== image.uid))
    } catch {
      alert('Não foi possível remover a imagem.')
    }
  }

  async function onSubmit(data: CarFormData) {
    if (!user) return

    if (images.length === 0) {
      alert('Adicione ao menos uma imagem do veículo.')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'cars'), {
        name: data.name,
        brand: data.brand,
        model: data.model,
        year: data.year,
        km: data.km,
        price: Number(data.price),
        city: data.city,
        whatsapp: data.whatsapp,
        description: data.description,
        created: serverTimestamp(),
        ownerId: user.uid,
        ownerName: user.name,
        ownerEmail: user.email,
        images: images.map((image) => ({ name: image.name, url: image.url })),
      })

      reset()
      setImages([])
      navigate('/dashboard')
    } catch {
      alert('Não foi possível cadastrar o anúncio. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <CarImageUploader
        images={images}
        uploadingIds={uploadingIds}
        onFilesSelected={handleFilesSelected}
        onRemoveImage={handleRemoveImage}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-10 flex w-full flex-col gap-4 rounded-lg bg-white p-4"
      >
        <CarFormFields register={register} errors={errors} />

        <button
          type="submit"
          disabled={submitting}
          className="h-11 w-full rounded-lg bg-orange-500 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
        >
          {submitting ? 'Cadastrando...' : 'Cadastrar veículo'}
        </button>
      </form>
    </Container>
  )
}
