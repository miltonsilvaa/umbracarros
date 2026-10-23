import { FiLogOut, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Container } from '../Container'

export function Header() {
  const { signed, loadingAuth, user, handleLogout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-center border-b border-gray-200 bg-white">
      <Container>
        <div className="flex w-full items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-bold text-gray-900">
              Web<span className="text-orange-500">Carros</span>
            </h1>
          </Link>

          {!loadingAuth && (
            <div className="flex items-center gap-4">
              {signed ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-gray-700 transition-colors hover:text-orange-500"
                  >
                    <FiUser size={22} />
                    <span className="hidden text-sm sm:inline">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 transition-colors hover:text-red-500"
                  >
                    <FiLogOut size={20} />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  Acessar
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </header>
  )
}
