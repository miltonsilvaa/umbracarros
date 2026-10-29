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
  isFavorited: boolean;
};

export type CarDetail = CarListItem & {
  description: string | null;
  fuel: string | null;
  color: string | null;
  whatsapp: string | null;
  images: string[];
};

export async function getCars(userId?: string | null): Promise<CarListItem[]> {
  const [cars, favorites] = await Promise.all([
    prisma.car.findMany({
      where: { sold: false },
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    }),
    userId
      ? prisma.favorite.findMany({ where: { userId }, select: { carId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteCarIds = new Set(favorites.map((favorite) => favorite.carId));

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
    isFavorited: favoriteCarIds.has(car.id),
  }));
}

export async function getCarById(
  id: string,
  userId?: string | null,
): Promise<CarDetail | null> {
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      images: { orderBy: { createdAt: "asc" } },
      favorites: { where: { userId: userId ?? "" } },
    },
  });

  if (!car) {
    return null;
  }

  return {
    id: car.id,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    km: car.km,
    price: car.price.toNumber(),
    city: car.city,
    imageUrl: car.images[0]?.url ?? null,
    description: car.description,
    fuel: car.fuel,
    color: car.color,
    whatsapp: car.whatsapp,
    images: car.images.map((image) => image.url),
    isFavorited: userId ? car.favorites.length > 0 : false,
  };
}
