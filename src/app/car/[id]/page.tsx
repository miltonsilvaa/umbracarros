import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/Container";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getCarById } from "@/lib/cars";

export default function CarPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Container>
      <Suspense fallback={<p className="mt-10 text-center text-gray-500">Carregando...</p>}>
        <CarDetail params={params} />
      </Suspense>
    </Container>
  );
}

async function CarDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const { userId } = await auth();
  const car = await getCarById(id, userId);

  if (!car) {
    notFound();
  }

  return (
    <div className="my-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="relative h-80 w-full overflow-hidden rounded-lg bg-gray-100 lg:h-[26rem]">
        {car.imageUrl && (
          <Image
            src={car.imageUrl}
            alt={car.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        )}
        <FavoriteButton
          carId={car.id}
          initialFavorited={car.isFavorited}
          className="absolute right-3 top-3"
        />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-800">{car.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {car.brand} · {car.model} · {car.year} · {car.km.toLocaleString("pt-BR")} km
        </p>
        <p className="my-4 text-3xl font-bold text-orange-500">
          {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>

        <div className="mb-4 h-px bg-gray-200" />

        <dl className="grid grid-cols-2 gap-3 text-sm">
          {car.fuel && (
            <div>
              <dt className="text-gray-500">Combustível</dt>
              <dd className="font-medium text-gray-800">{car.fuel}</dd>
            </div>
          )}
          {car.color && (
            <div>
              <dt className="text-gray-500">Cor</dt>
              <dd className="font-medium text-gray-800">{car.color}</dd>
            </div>
          )}
          {car.city && (
            <div>
              <dt className="text-gray-500">Localização</dt>
              <dd className="font-medium text-gray-800">{car.city}</dd>
            </div>
          )}
        </dl>

        {car.description && (
          <p className="mt-6 whitespace-pre-line text-gray-700">{car.description}</p>
        )}

        {car.whatsapp && (
          <a
            href={`https://wa.me/${car.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Conversar no WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
