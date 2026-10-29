import Link from "next/link";
import { Container } from "@/components/Container";

export default function DashboardPage() {
  return (
    <Container>
      <div className="mx-auto mt-10 max-w-xl text-center">
        <h1 className="text-2xl font-bold text-gray-800">Painel do anunciante</h1>
        <p className="mt-2 text-gray-500">Gerencie seus anúncios de carros por aqui.</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/dashboard/new"
            className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Cadastrar novo carro
          </Link>
          <Link
            href="/dashboard/favoritos"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-orange-500 hover:text-orange-500"
          >
            Meus favoritos
          </Link>
        </div>
      </div>
    </Container>
  );
}
