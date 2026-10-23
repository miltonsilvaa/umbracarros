import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { useEffect, useState, type ChangeEvent } from 'react'
import { CarCard } from '../../components/CarCard'
import { Container } from '../../components/Container'
import { db } from '../../services/firebaseConnection'
import type { CarProps } from '../../types/car'

const PAGE_SIZE = 9

function mapDocs(docs: QueryDocumentSnapshot<DocumentData>[]): CarProps[] {
  return docs.map((carDoc) => ({
    id: carDoc.id,
    ...(carDoc.data() as Omit<CarProps, 'id'>),
  }))
}

// Busca client-side: filtra só os carros já carregados em "allCars" (a página atual da
// paginação), não é uma busca global no Firestore. Um carro fora da(s) página(s) já buscada(s)
// não aparece mesmo que o termo bata — trade-off aceito pra evitar criar índices/queries extras
// agora. Por isso "Carregar mais" fica escondido enquanto há busca ativa (ver handleSearch):
// combinar os dois exigiria re-filtrar a cada nova página, o que ainda não cobre o catálogo
// inteiro de qualquer forma.
function filterCars(list: CarProps[], term: string) {
  const normalized = term.trim().toLowerCase()
  if (!normalized) return list

  return list.filter(
    (car) =>
      car.name.toLowerCase().includes(normalized) ||
      car.brand.toLowerCase().includes(normalized) ||
      car.model.toLowerCase().includes(normalized),
  )
}

export function Home() {
  const [allCars, setAllCars] = useState<CarProps[]>([])
  const [cars, setCars] = useState<CarProps[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {
    setLoading(true)

    const carsRef = collection(db, 'cars')
    const firstQuery = query(carsRef, orderBy('created', 'desc'), limit(PAGE_SIZE))
    const snapshot = await getDocs(firstQuery)
    const list = mapDocs(snapshot.docs)

    setAllCars(list)
    setCars(list)
    setLastDoc(snapshot.docs.at(-1) ?? null)
    setHasMore(snapshot.docs.length === PAGE_SIZE)
    setLoading(false)
  }

  async function handleLoadMore() {
    if (!lastDoc) return

    const carsRef = collection(db, 'cars')
    const nextQuery = query(carsRef, orderBy('created', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE))
    const snapshot = await getDocs(nextQuery)
    const list = mapDocs(snapshot.docs)

    const updated = [...allCars, ...list]
    setAllCars(updated)
    setCars(filterCars(updated, search))
    setLastDoc(snapshot.docs.at(-1) ?? null)
    setHasMore(snapshot.docs.length === PAGE_SIZE)
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const term = event.target.value
    setSearch(term)
    setCars(filterCars(allCars, term))
  }

  return (
    <Container>
      <section className="my-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Digite o nome ou marca do carro..."
          className="h-11 w-full rounded-lg border-2 border-gray-300 px-3 outline-none transition-colors focus:border-orange-500"
        />
      </section>

      <h1 className="mb-6 mt-6 text-center text-2xl font-bold text-gray-800">
        Carros novos e usados em todo o Brasil
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Carregando veículos...</p>
      ) : cars.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum veículo encontrado.</p>
      ) : (
        <main className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </main>
      )}

      {!loading && hasMore && !search && (
        <div className="mb-10 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            Carregar mais
          </button>
        </div>
      )}
    </Container>
  )
}
