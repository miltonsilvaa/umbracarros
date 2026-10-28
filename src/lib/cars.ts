import { prisma } from "@/lib/prisma";

export type CarListItem = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  city: string | null;
  imageUrl: string | null;
};

export async function getCars(): Promise<CarListItem[]> {
  const cars = await prisma.car.findMany({
    where: { sold: false },
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  return cars.map((car) => ({
    id: car.id,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    km: car.km,
    price: car.price.toNumber(),
    city: car.city,
    imageUrl: car.images[0]?.url ?? null,
  }));
}
