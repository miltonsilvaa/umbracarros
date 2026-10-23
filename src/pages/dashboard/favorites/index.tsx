import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { CarCard } from '../../../components/CarCard'
import { Container } from '../../../components/Container'
import { DashboardHeader } from '../../../components/DashboardHeader'
import { useFavorites } from '../../../hooks/useFavorites'
import { db } from '../../../services/firebaseConnection'
import type { CarProps } from '../../../types/car'

export function Favorites() {
  const { favoriteIds, loadingFavorites, toggleFavorite } = useFavorites()
  const [cars, setCars] = useState<CarProps[]>([])
  const [loadingCars, setLoadingCars] = useState(true)

  useEffect(() => {
    if (loadingFavorites) return
    loadFavoriteCars()
  }, [loadingFavorites, favoriteIds])

  async function loadFavoriteCars() {
    setLoadingCars(true)

    const ids = Array.from(favoriteIds)
    const snapshots = await Promise.all(ids.map((carId) => getDoc(doc(db, 'cars', carId))))

    const validCars: CarProps[] = []

    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists()) {
        validCars.push({ id: snapshot.id, ...(snapshot.data() as Omit<CarProps, 'id'>) })
      } else {
        // O carro favoritado foi excluído pelo dono — o doc em "favorites" ficou órfão.
        // Já sabemos que está marcado como favorito (favoriteIds), então reaproveita o
        // toggle existente pra limpar esse registro órfão da coleção e do estado local.
        toggleFavorite(ids[index])
      }
    })

    setCars(validCars)
    setLoadingCars(false)
  }

  return (
    <Container>
      <DashboardHeader />

      {loadingCars ? (
        <p className="py-10 text-center text-gray-500">Carregando favoritos...</p>
      ) : cars.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Você ainda não favoritou nenhum carro.</p>
      ) : (
        <main className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </main>
      )}
    </Container>
  )
}
