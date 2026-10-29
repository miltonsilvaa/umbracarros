import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Container } from "@/components/Container";
import { CarCard } from "@/components/CarCard";
import { getCars } from "@/lib/cars";

export default function Home() {
  return (
    <Container>
      <h1 className="mb-6 mt-6 text-center text-2xl font-bold text-gray-800">
        Carros novos e usados em todo o Brasil
      </h1>

      <Suspense fallback={<p className="text-center text-gray-500">Carregando veículos...</p>}>
        <CarList />
      </Suspense>
    </Container>
  );
}

async function CarList() {
  await connection();
  const { userId } = await auth();
  const cars = await getCars(userId);

  if (cars.length === 0) {
    return <p className="text-center text-gray-500">Nenhum veículo encontrado.</p>;
  }

  return (
    <main className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </main>
  );
}
