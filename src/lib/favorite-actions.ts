"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(carId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Você precisa estar logado para favoritar." };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_carId: { userId, carId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, carId } });
  }

  revalidatePath("/");
  revalidatePath(`/car/${carId}`);
  revalidatePath("/dashboard/favoritos");

  return { favorited: !existing };
}
