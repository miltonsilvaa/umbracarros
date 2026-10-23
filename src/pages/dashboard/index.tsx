import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { useEffect, useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { DashboardHeader } from '../../components/DashboardHeader'
import { useAuth } from '../../hooks/useAuth'
import { db, storage } from '../../services/firebaseConnection'
import type { CarProps } from '../../types/car'

export function Dashboard() {
  const { user } = useAuth()
  const [cars, setCars] = useState<CarProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadCars(user.uid)
  }, [user])

  async function loadCars(uid: string) {
    setLoading(true)
    const carsRef = collection(db, 'cars')
    const carsQuery = query(carsRef, where('ownerId', '==', uid))
    const snapshot = await getDocs(carsQuery)

    setCars(
      snapshot.docs.map((carDoc) => ({
        id: carDoc.id,
        ...(carDoc.data() as Omit<CarProps, 'id'>),
      })),
    )
    setLoading(false)
  }

  async function handleDelete(car: CarProps) {
    const confirmed = window.confirm(`Excluir o anúncio "${car.name}"?`)
    if (!confirmed) return

    try {
      // Storage primeiro, Firestore depois: se o doc fosse apagado antes, uma falha no
      // Storage deixaria arquivos órfãos (sem dono visível, já que o doc que os referenciava
      // não existe mais) e sem jeito fácil de encontrá-los de novo pra limpar.
      await Promise.all(
        car.images.map((image) => deleteObject(ref(storage, `images/${car.ownerId}/${image.name}`))),
      )
      await deleteDoc(doc(db, 'cars', car.id))
      setCars((prev) => prev.filter((item) => item.id !== car.id))
    } catch (error) {
      console.error(`[Dashboard] Falha ao excluir o anúncio ${car.id} ("${car.name}"):`, error)
      alert('Não foi possível excluir o anúncio. Tente novamente.')
    }
  }

  return (
    <Container>
      <DashboardHeader />

      {loading ? (
        <p className="py-10 text-center text-gray-500">Carregando seus anúncios...</p>
      ) : cars.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Você ainda não cadastrou nenhum veículo.</p>
      ) : (
        <main className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <div key={car.id} className="relative overflow-hidden rounded-lg bg-white shadow">
              <div className="absolute right-2 top-2 z-10 flex gap-2">
                <Link
                  to={`/dashboard/edit/${car.id}`}
                  className="rounded-full bg-white p-2 text-gray-600 shadow hover:bg-gray-50"
                >
                  <FiEdit2 size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(car)}
                  className="rounded-full bg-white p-2 text-red-500 shadow hover:bg-red-50"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
              <div className="h-48 w-full overflow-hidden bg-gray-100">
                <img src={car.images[0]?.url} alt={car.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <h2 className="truncate text-lg font-semibold text-gray-800">{car.name}</h2>
                <p className="text-sm text-gray-500">
                  {car.year} · {car.km} km
                </p>
                <p className="mt-2 text-xl font-bold text-orange-500">
                  {car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          ))}
        </main>
      )}
    </Container>
  )
}
