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
import { createContext, useEffect, useRef, useState, type ReactNode } from 'react'
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
  // Carros com um toggle em andamento: bloqueia um segundo clique no mesmo carro antes do
  // primeiro terminar, já que ambos leriam o mesmo "alreadyFavorite" da closure e dessincronizariam
  // Firestore e UI (ex.: dois setDoc, ou um setDoc seguido de deleteDoc perdendo a ordem real).
  const pendingToggles = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set())
      return
    }

    // Evita que a resposta de uma troca de usuário anterior (ex.: login rápido A -> logout ->
    // login B) chegue depois e sobrescreva o estado do usuário atual com favoritos de outra conta.
    let ignore = false
    const uid = user.uid

    // Carrega o conjunto completo de IDs favoritados uma vez por login, em vez de cada CarCard
    // fazer sua própria leitura — numa grade de 9+ carros isso seria 9+ leituras do Firestore só
    // pra pintar o coração, por um ganho que cabe numa única query (where uid == user).
    async function loadFavorites() {
      setLoadingFavorites(true)
      try {
        const favoritesRef = collection(db, 'favorites')
        const favoritesQuery = query(favoritesRef, where('uid', '==', uid))
        const snapshot = await getDocs(favoritesQuery)

        if (ignore) return
        setFavoriteIds(new Set(snapshot.docs.map((favoriteDoc) => favoriteDoc.data().carId as string)))
      } catch (error) {
        console.error('[FavoritesContext] Falha ao carregar favoritos:', error)
      } finally {
        if (!ignore) setLoadingFavorites(false)
      }
    }

    loadFavorites()

    return () => {
      ignore = true
    }
  }, [user])

  function isFavorite(carId: string) {
    return favoriteIds.has(carId)
  }

  async function toggleFavorite(carId: string) {
    if (!user) return
    if (pendingToggles.current.has(carId)) return
    pendingToggles.current.add(carId)

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
    } finally {
      pendingToggles.current.delete(carId)
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loadingFavorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
