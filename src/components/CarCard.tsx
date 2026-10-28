import Image from "next/image";
import Link from "next/link";
import type { CarListItem } from "@/lib/cars";

export function CarCard({ car }: { car: CarListItem }) {
  return (
    <Link
      href={`/car/${car.id}`}
      className="group block overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {car.imageUrl && (
          <Image
            src={car.imageUrl}
            alt={car.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <h2 className="truncate text-lg font-semibold text-gray-800">{car.title}</h2>
        <p className="text-sm text-gray-500">
          {car.year} · {car.km.toLocaleString("pt-BR")} km
        </p>
        <p className="my-2 text-xl font-bold text-orange-500">
          {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <div className="my-2 h-px bg-gray-200" />
        {car.city && <p className="text-sm text-gray-500">{car.city}</p>}
      </div>
    </Link>
  );
}
