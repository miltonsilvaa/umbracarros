import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_USER_ID = "seed-user-1";

const cars = [
  {
    title: "Honda Civic EXL 2.0",
    brand: "Honda",
    model: "Civic",
    year: 2022,
    km: 32000,
    price: 128900,
    description: "Único dono, revisões em dia, completo.",
    fuel: "Flex",
    color: "Preto",
    city: "São Paulo - SP",
    whatsapp: "11999999999",
    images: ["https://picsum.photos/seed/civic-2022/800/600"],
  },
  {
    title: "Jeep Compass Longitude",
    brand: "Jeep",
    model: "Compass",
    year: 2021,
    km: 41500,
    price: 142500,
    description: "Teto solar, bancos de couro, 4x2 Diesel.",
    fuel: "Diesel",
    color: "Branco",
    city: "Curitiba - PR",
    whatsapp: "41988888888",
    images: ["https://picsum.photos/seed/compass-2021/800/600"],
  },
  {
    title: "Volkswagen Polo Highline",
    brand: "Volkswagen",
    model: "Polo",
    year: 2023,
    km: 12800,
    price: 98700,
    description: "Seminovo, garantia de fábrica até 2026.",
    fuel: "Flex",
    color: "Cinza",
    city: "Belo Horizonte - MG",
    whatsapp: "31977777777",
    images: ["https://picsum.photos/seed/polo-2023/800/600"],
  },
  {
    title: "Toyota Corolla Altis Hybrid",
    brand: "Toyota",
    model: "Corolla",
    year: 2020,
    km: 58200,
    price: 135900,
    description: "Híbrido, baixíssimo consumo, multimídia original.",
    fuel: "Híbrido",
    color: "Prata",
    city: "Porto Alegre - RS",
    whatsapp: "51966666666",
    images: ["https://picsum.photos/seed/corolla-2020/800/600"],
  },
];

async function main() {
  for (const car of cars) {
    const { images, ...data } = car;

    await prisma.car.create({
      data: {
        ...data,
        userId: SEED_USER_ID,
        images: {
          create: images.map((url) => ({ url })),
        },
      },
    });
  }

  console.log(`Seed concluído: ${cars.length} carros criados.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
