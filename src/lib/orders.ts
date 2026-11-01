import { prisma } from "@/lib/prisma";

export async function getOrderByCheckoutSessionId(sessionId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { stripeCheckoutSessionId: sessionId, userId },
    include: { car: { select: { title: true } } },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    status: order.status,
    total: order.total.toNumber(),
    carTitle: order.car.title,
  };
}
