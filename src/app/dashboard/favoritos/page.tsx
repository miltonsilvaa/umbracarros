import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/Container";
import { CarCard } from "@/components/CarCard";
import { getFavoriteCars } from "@/lib/favorites";

export default function FavoritosPage() {
  return (
    <Container>
      <h1 className="mb-6 mt-6 text-2xl font-bold text-gray-800">Meus favoritos</h1>

      <Suspense fallback={<p className="text-center text-gray-500">Carregando favoritos...</p>}>
        <FavoritesList />
      </Suspense>
    </Container>
  );
}

async function FavoritesList() {
  await connection();
  const { userId } = await auth();
  const cars = await getFavoriteCars(userId!);

  if (cars.length === 0) {
    return <p className="mb-10 text-center text-gray-500">Você ainda não favoritou nenhum carro.</p>;
  }

  return (
    <main className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </main>
  );
}
