import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getOrderByCheckoutSessionId } from "@/lib/orders";

export default function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <Container>
      <Suspense fallback={<p className="mt-10 text-center text-gray-500">Carregando...</p>}>
        <OrderStatus params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OrderStatus({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  await connection();

  const { id } = await params;
  const { session_id } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/car/${id}`);
  }

  if (!session_id) {
    redirect(`/car/${id}`);
  }

  const order = await getOrderByCheckoutSessionId(session_id, userId);

  if (!order) {
    redirect(`/car/${id}`);
  }

  const isPaid = order.status === "PAID";

  return (
    <div className="mx-auto my-16 max-w-md text-center">
      <h1 className="text-2xl font-bold text-gray-800">
        {isPaid ? "Pagamento confirmado!" : "Pagamento sendo confirmado..."}
      </h1>
      <p className="mt-3 text-gray-600">
        {isPaid
          ? `Sua reserva para "${order.carTitle}" foi confirmada com sucesso.`
          : `Recebemos seu pagamento para "${order.carTitle}" e estamos aguardando a confirmação. Isso pode levar alguns segundos — recarregue a página se necessário.`}
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        Ir para o painel
      </Link>
    </div>
  );
}
