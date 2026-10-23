import type { Timestamp } from 'firebase/firestore'

export interface CarImageProps {
  name: string
  url: string
}

export interface CarProps {
  id: string
  name: string
  model: string
  brand: string
  year: string
  km: string
  price: number
  city: string
  whatsapp: string
  description: string
  // Gravado com serverTimestamp() (ver New.tsx). Fica "null" no cache local até o servidor
  // confirmar o valor — não ocorre em getDocs() online (todas as leituras deste app são
  // getDocs, não onSnapshot), mas o tipo reflete a possibilidade real da SDK.
  created: Timestamp | null
  ownerId: string
  ownerName: string
  ownerEmail: string
  images: CarImageProps[]
}
