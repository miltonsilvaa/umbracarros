import { Link } from 'react-router-dom'
import { Container } from '../../components/Container'

export function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-5xl font-bold text-gray-800">404</h1>
        <p className="text-gray-500">Essa página não existe ou foi removida.</p>
        <Link
          to="/"
          className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          Voltar para a Home
        </Link>
      </div>
    </Container>
  )
}
