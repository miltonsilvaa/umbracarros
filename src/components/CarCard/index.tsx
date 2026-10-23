import type { MouseEvent } from 'react'
import { FiHeart } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'
import type { CarProps } from '../../types/car'

export function CarCard({ car }: { car: CarProps }) {
  const navigate = useNavigate()
  const { signed } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(car.id)

  function handleToggleFavorite(event: MouseEvent) {
    // O card todo é um <Link>: sem isso, o clique no coração também navegaria pro detalhe.
    event.preventDefault()
    event.stopPropagation()

    if (!signed) {
      navigate('/login')
      return
    }

    toggleFavorite(car.id)
  }

  return (
    <Link to={`/car/${car.id}`} className="group relative block">
      <button
        onClick={handleToggleFavorite}
        aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white"
      >
        <FiHeart size={18} className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
      </button>

      <div className="w-full overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg">
        <div className="h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={car.images[0]?.url}
            alt={car.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h2 className="truncate text-lg font-semibold text-gray-800">{car.name}</h2>
          <p className="text-sm text-gray-500">
            {car.year} · {car.km} km
          </p>
          <p className="my-2 text-xl font-bold text-orange-500">
            {car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <div className="my-2 h-px bg-gray-200" />
          <p className="text-sm text-gray-500">{car.city}</p>
        </div>
      </div>
    </Link>
  )
}
