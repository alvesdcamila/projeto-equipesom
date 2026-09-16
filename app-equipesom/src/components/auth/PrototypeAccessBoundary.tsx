import { Navigate, Outlet } from 'react-router-dom'
import { runtimeEnvironment } from '../../config/runtimeEnvironment'

/**
 * Mantém dados demonstrativos restritos ao build local até existir sessão real.
 * Esta barreira de apresentação não substitui autorização no servidor ou no banco.
 */
export function PrototypeAccessBoundary() {
  if (!runtimeEnvironment.allowsPrototypeData) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
