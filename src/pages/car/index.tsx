import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Container } from '../../components/Container'
import { db } from '../../services/firebaseConnection'
import type { CarProps } from '../../types/car'

export function CarDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [car, setCar] = useState<CarProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (!id) return
    loadCar(id)
  }, [id])

  async function loadCar(carId: string) {
    setLoading(true)
    const carRef = doc(db, 'cars', carId)
    const snapshot = await getDoc(carRef)

    if (!snapshot.exists()) {
      navigate('/', { replace: true })
      return
    }

    setCar({ id: snapshot.id, ...(snapshot.data() as Omit<CarProps, 'id'>) })
    setSlide(0)
    setLoading(false)
  }

  function handlePrev() {
    if (!car) return
    setSlide((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))
  }

  function handleNext() {
    if (!car) return
    setSlide((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <Container>
        <p className="py-10 text-center text-gray-500">Carregando veículo...</p>
      </Container>
    )
  }

  if (!car) return null

  const whatsappMessage = encodeURIComponent(
    `Olá, vi o anúncio do ${car.name} no WebCarros e fiquei interessado!`,
  )

  return (
    <Container>
      <div className="mt-4 rounded-lg bg-white p-4">
        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-[440px]">
          {car.images.length > 0 && (
            <img src={car.images[slide].url} alt={car.name} className="h-full w-full object-cover" />
          )}

          {car.images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
              >
                <FiChevronLeft size={22} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
              >
                <FiChevronRight size={22} />
              </button>

              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={image.name}
                    onClick={() => setSlide(index)}
                    className={`h-2.5 w-2.5 rounded-full ${index === slide ? 'bg-orange-500' : 'bg-white/70'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{car.name}</h1>
            <p className="text-gray-500">{car.model}</p>
          </div>
          <p className="text-3xl font-bold text-orange-500">
            {car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <div className="my-4 h-px bg-gray-200" />

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-gray-400">Cidade</p>
            <p className="font-medium text-gray-800">{car.city}</p>
          </div>
          <div>
            <p className="text-gray-400">Ano</p>
            <p className="font-medium text-gray-800">{car.year}</p>
          </div>
          <div>
            <p className="text-gray-400">KM</p>
            <p className="font-medium text-gray-800">{car.km}</p>
          </div>
          <div>
            <p className="text-gray-400">Anunciante</p>
            <Link
              to={`/vendedor/${car.ownerId}`}
              className="font-medium text-gray-800 underline-offset-2 hover:text-orange-500 hover:underline"
            >
              {car.ownerName}
            </Link>
          </div>
        </div>

        <div className="my-4 h-px bg-gray-200" />

        <div>
          <h2 className="mb-2 font-semibold text-gray-800">Descrição</h2>
          <p className="whitespace-pre-line leading-relaxed text-gray-600">{car.description}</p>
        </div>

        <a
          href={`https://wa.me/55${car.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 font-medium text-white transition-colors hover:bg-green-700"
        >
          Falar com o vendedor
          <FaWhatsapp size={22} />
        </a>
      </div>
    </Container>
  )
}
