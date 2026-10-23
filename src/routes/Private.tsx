import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Private({ children }: { children: ReactNode }) {
  const { signed, loadingAuth } = useAuth()

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-500">
        Carregando...
      </div>
    )
  }

  if (!signed) {
    return <Navigate to="/login" replace />
  }

  return children
}
