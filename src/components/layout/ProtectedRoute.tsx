import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { session, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState message="Checking session…" />
  }

  if (!session) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}
