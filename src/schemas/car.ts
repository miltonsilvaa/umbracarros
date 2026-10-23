import { z } from 'zod'

export const carSchema = z.object({
  name: z.string().min(1, 'O nome do carro é obrigatório'),
  brand: z.string().min(1, 'A marca é obrigatória'),
  model: z.string().min(1, 'O modelo é obrigatório'),
  year: z.string().min(1, 'O ano é obrigatório'),
  km: z.string().min(1, 'A quilometragem é obrigatória'),
  price: z.string().min(1, 'O preço é obrigatório'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  whatsapp: z
    .string()
    .min(1, 'O WhatsApp é obrigatório')
    .refine((value) => /^\d{10,11}$/.test(value), 'Digite um WhatsApp válido (DDD + número)'),
  description: z.string().min(1, 'A descrição é obrigatória'),
})

export type CarFormData = z.infer<typeof carSchema>
