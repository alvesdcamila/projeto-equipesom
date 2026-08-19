import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { MobileNavigation } from './MobileNavigation'

export function AppShell() {
  const location = useLocation()
  const isWizard = location.pathname === '/propostas/nova'

  return (
    <div className="app-shell">
      <AppHeader compact={isWizard} />
      <main className={isWizard ? 'app-main app-main--wizard' : 'app-main'}>
        <Outlet />
      </main>
      <MobileNavigation />
    </div>
  )
}
