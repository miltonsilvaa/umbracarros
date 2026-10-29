import { prisma } from "@/lib/prisma";
import type { CarListItem } from "@/lib/cars";

export async function getFavoriteCars(userId: string): Promise<CarListItem[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        include: {
          images: {
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  return favorites.map(({ car }) => ({
    id: car.id,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    km: car.km,
    price: car.price.toNumber(),
    city: car.city,
    imageUrl: car.images[0]?.url ?? null,
    isFavorited: true,
  }));
}
