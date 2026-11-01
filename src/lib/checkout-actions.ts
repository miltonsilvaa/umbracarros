"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCarById } from "@/lib/cars";

type CheckoutResult = { error: string } | { url: string };

export async function createCheckoutSession(carId: string): Promise<CheckoutResult> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Você precisa estar logado para reservar." };
  }

  const car = await getCarById(carId);

  if (!car) {
    return { error: "Carro não encontrado." };
  }

  if (car.sold) {
    return { error: "Este carro já foi reservado ou vendido." };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: car.title,
            images: car.imageUrl ? [car.imageUrl] : undefined,
          },
          unit_amount: Math.round(car.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/car/${carId}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/car/${carId}`,
    metadata: { carId, userId },
  });

  if (!session.url) {
    return { error: "Não foi possível iniciar o pagamento. Tente novamente." };
  }

  await prisma.order.create({
    data: {
      userId,
      carId,
      total: car.price,
      status: "PENDING",
      stripeCheckoutSessionId: session.id,
    },
  });

  return { url: session.url };
}
