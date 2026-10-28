import Link from "next/link";
import { Container } from "@/components/Container";

export default function DashboardPage() {
  return (
    <Container>
      <div className="mx-auto mt-10 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-gray-800">Painel do anunciante</h1>
        <p className="mt-2 text-gray-500">Gerencie seus anúncios de carros por aqui.</p>

        <Link
          href="/dashboard/new"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          Cadastrar novo carro
        </Link>
      </div>
    </Container>
  );
}
