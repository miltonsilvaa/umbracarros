"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { carSchema, type CarFormInput } from "@/lib/validations/car";

export async function createCar(values: CarFormInput) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Você precisa estar logado para cadastrar um carro." };
  }

  const parsed = carSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Dados inválidos. Revise o formulário e tente novamente." };
  }

  const { imageUrl, ...data } = parsed.data;

  await prisma.car.create({
    data: {
      ...data,
      userId,
      images: {
        create: [{ url: imageUrl }],
      },
    },
  });

  redirect("/dashboard");
}
