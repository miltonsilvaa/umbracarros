import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { FiUser } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { CarCard } from '../../components/CarCard'
import { Container } from '../../components/Container'
import { db } from '../../services/firebaseConnection'
import type { CarProps } from '../../types/car'

export function Vendor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cars, setCars] = useState<CarProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadVendorCars(id)
  }, [id])

  async function loadVendorCars(ownerId: string) {
    setLoading(true)
    const carsRef = collection(db, 'cars')
    const vendorQuery = query(carsRef, where('ownerId', '==', ownerId), orderBy('created', 'desc'))
    const snapshot = await getDocs(vendorQuery)

    setCars(
      snapshot.docs.map((carDoc) => ({
        id: carDoc.id,
        ...(carDoc.data() as Omit<CarProps, 'id'>),
      })),
    )
    setLoading(false)
  }

  if (loading) {
    return (
      <Container>
        <p className="py-10 text-center text-gray-500">Carregando anúncios do vendedor...</p>
      </Container>
    )
  }

  // Não existe collection "users" neste projeto (ver CLAUDE.md) — nome/e-mail do vendedor vêm
  // denormalizados do próprio anúncio (ownerName/ownerEmail em "cars"), por isso só conseguimos
  // mostrá-los se houver ao menos um anúncio ativo. Sem anúncios, não há de onde tirar esses
  // dados — por isso o botão "voltar" em vez de uma página de perfil vazia.
  const vendor = cars[0]

  if (!vendor) {
    return (
      <Container>
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-gray-500">Este vendedor não tem nenhum anúncio ativo no momento.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Voltar para a Home
          </button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="my-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-500">
          <FiUser size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{vendor.ownerName}</h1>
          <p className="text-sm text-gray-500">{vendor.ownerEmail}</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-700">
        {cars.length} {cars.length === 1 ? 'anúncio' : 'anúncios'}
      </h2>

      <main className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </main>
    </Container>
  )
}
