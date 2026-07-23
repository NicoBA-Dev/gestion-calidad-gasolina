import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base font-mono text-sm text-gray-500">
        Cargando sesión...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}