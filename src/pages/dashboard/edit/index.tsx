import { zodResolver } from '@hookform/resolvers/zod'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { CarFormFields } from '../../../components/CarFormFields'
import { CarImageUploader, type ImageItemProps } from '../../../components/CarImageUploader'
import { Container } from '../../../components/Container'
import { DashboardHeader } from '../../../components/DashboardHeader'
import { useAuth } from '../../../hooks/useAuth'
import { carSchema, type CarFormData } from '../../../schemas/car'
import { db, storage } from '../../../services/firebaseConnection'
import type { CarProps } from '../../../types/car'

export function Edit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormData>({ resolver: zodResolver(carSchema), mode: 'onChange' })

  const [car, setCar] = useState<CarProps | null>(null)
  const [loadingCar, setLoadingCar] = useState(true)
  const [images, setImages] = useState<ImageItemProps[]>([])
  const [uploadingIds, setUploadingIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    loadCar(id, user.uid)
  }, [id, user])

  async function loadCar(carId: string, uid: string) {
    setLoadingCar(true)
    const carRef = doc(db, 'cars', carId)
    const snapshot = await getDoc(carRef)

    if (!snapshot.exists()) {
      navigate('/dashboard', { replace: true })
      return
    }

    const loadedCar = { id: snapshot.id, ...(snapshot.data() as Omit<CarProps, 'id'>) }

    // Checagem de dono no cliente só evita que a tela de edição abra pra quem não é o dono —
    // quem de fato bloqueia a escrita é a regra do Firestore (ownerId == auth.uid), não isto.
    if (loadedCar.ownerId !== uid) {
      navigate('/dashboard', { replace: true })
      return
    }

    setCar(loadedCar)
    reset({
      name: loadedCar.name,
      brand: loadedCar.brand,
      model: loadedCar.model,
      year: loadedCar.year,
      km: loadedCar.km,
      price: String(loadedCar.price),
      city: loadedCar.city,
      whatsapp: loadedCar.whatsapp,
      description: loadedCar.description,
    })
    setImages(
      loadedCar.images.map((image) => ({
        uid: image.name,
        name: image.name,
        previewUrl: image.url,
        url: image.url,
      })),
    )
    setLoadingCar(false)
  }

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
      setUploadingIds((prev) => prev.filter((item) => item !== uid))
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
    if (!user || !car) return

    if (images.length === 0) {
      alert('Adicione ao menos uma imagem do veículo.')
      return
    }

    setSubmitting(true)
    try {
      // "created", "ownerId", "ownerName" e "ownerEmail" não entram no payload: updateDoc só
      // altera os campos informados, então o anúncio continua com o dono e a data originais.
      await updateDoc(doc(db, 'cars', car.id), {
        name: data.name,
        brand: data.brand,
        model: data.model,
        year: data.year,
        km: data.km,
        price: Number(data.price),
        city: data.city,
        whatsapp: data.whatsapp,
        description: data.description,
        images: images.map((image) => ({ name: image.name, url: image.url })),
      })

      navigate('/dashboard')
    } catch (error) {
      console.error(`[Edit] Falha ao atualizar o anúncio ${car.id}:`, error)
      alert('Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCar) {
    return (
      <Container>
        <DashboardHeader />
        <p className="py-10 text-center text-gray-500">Carregando anúncio...</p>
      </Container>
    )
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
          {submitting ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </Container>
  )
}
