import { z } from "zod";

export const DEFAULT_CAR_IMAGE_URL = "https://picsum.photos/800/600";

export const carSchema = z.object({
  title: z.string().min(3, "Informe um título com pelo menos 3 caracteres"),
  brand: z.string().min(2, "Informe a marca"),
  model: z.string().min(1, "Informe o modelo"),
  year: z.coerce
    .number()
    .int("Ano inválido")
    .min(1950, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano inválido"),
  km: z.coerce.number().int("KM inválido").min(0, "KM inválido"),
  price: z.coerce.number().positive("Informe um preço válido"),
  description: z.string().optional(),
  fuel: z.string().optional(),
  color: z.string().optional(),
  city: z.string().optional(),
  whatsapp: z.string().optional(),
  imageUrl: z
    .string()
    .trim()
    .transform((value) => (value === "" ? DEFAULT_CAR_IMAGE_URL : value))
    .pipe(z.string().url("Informe uma URL de imagem válida")),
});

export type CarFormInput = z.input<typeof carSchema>;
export type CarFormValues = z.output<typeof carSchema>;
