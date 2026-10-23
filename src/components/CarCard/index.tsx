import { Link } from 'react-router-dom'
import type { CarProps } from '../../types/car'

export function CarCard({ car }: { car: CarProps }) {
  return (
    <Link to={`/car/${car.id}`} className="group">
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
