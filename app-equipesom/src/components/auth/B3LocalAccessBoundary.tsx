import { Navigate, Outlet } from 'react-router-dom'
import { runtimeEnvironment } from '../../config/runtimeEnvironment'
import { useB3LocalSession } from './B3LocalSession'

export function B3LocalAccessBoundary() {
  const { session } = useB3LocalSession()
  if (!runtimeEnvironment.b3LocalAuthEnabled || !session) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
