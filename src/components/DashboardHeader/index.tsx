import { Link } from 'react-router-dom'

export function DashboardHeader() {
  return (
    <div className="mb-4 mt-4 flex h-10 w-full items-center justify-between rounded-lg bg-gray-900 px-4">
      <span className="text-sm font-medium text-white">Painel do usuário</span>
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/favorites"
          className="text-sm font-medium text-orange-400 hover:text-orange-300"
        >
          Favoritos
        </Link>
        <Link to="/dashboard/new" className="text-sm font-medium text-orange-400 hover:text-orange-300">
          Novo anúncio
        </Link>
      </div>
    </div>
  )
}
