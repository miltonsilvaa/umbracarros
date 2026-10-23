import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db } from '../services/firebaseConnection'

interface FavoritesContextData {
  favoriteIds: Set<string>
  loadingFavorites: boolean
  isFavorite: (carId: string) => boolean
  toggleFavorite: (carId: string) => Promise<void>
}

export const FavoritesContext = createContext({} as FavoritesContextData)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set())
      return
    }
    loadFavorites(user.uid)
  }, [user])

  // Carrega o conjunto completo de IDs favoritados uma vez por login, em vez de cada CarCard
  // fazer sua própria leitura — numa grade de 9+ carros isso seria 9+ leituras do Firestore só
  // pra pintar o coração, por um ganho que cabe numa única query (where uid == user).
  async function loadFavorites(uid: string) {
    setLoadingFavorites(true)
    const favoritesRef = collection(db, 'favorites')
    const favoritesQuery = query(favoritesRef, where('uid', '==', uid))
    const snapshot = await getDocs(favoritesQuery)

    setFavoriteIds(new Set(snapshot.docs.map((favoriteDoc) => favoriteDoc.data().carId as string)))
    setLoadingFavorites(false)
  }

  function isFavorite(carId: string) {
    return favoriteIds.has(carId)
  }

  async function toggleFavorite(carId: string) {
    if (!user) return

    // ID determinístico "{uid}_{carId}": favoritar/desfavoritar vira um set/delete direto por
    // ID conhecido (sem query pra achar o doc) e evita duplicar favorito do mesmo carro.
    const favoriteRef = doc(db, 'favorites', `${user.uid}_${carId}`)
    const alreadyFavorite = favoriteIds.has(carId)

    try {
      if (alreadyFavorite) {
        await deleteDoc(favoriteRef)
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(carId)
          return next
        })
      } else {
        await setDoc(favoriteRef, { uid: user.uid, carId, createdAt: serverTimestamp() })
        setFavoriteIds((prev) => new Set(prev).add(carId))
      }
    } catch (error) {
      console.error(`[FavoritesContext] Falha ao atualizar favorito do carro ${carId}:`, error)
      alert('Não foi possível atualizar seus favoritos. Tente novamente.')
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loadingFavorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
