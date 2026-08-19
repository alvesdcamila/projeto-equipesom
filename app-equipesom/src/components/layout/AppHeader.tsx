import { Bell, HelpCircle, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AppHeaderProps {
  compact?: boolean
}

export function AppHeader({ compact = false }: AppHeaderProps) {
  return (
    <header className={compact ? 'app-header app-header--compact' : 'app-header'}>
      <div className="app-header__inner">
        <Link className="brand" to="/" aria-label="EQUIPESOM — ir ao início">
          <span className="brand__mark" aria-hidden="true">
            <Waves size={19} strokeWidth={2.2} />
          </span>
          <span className="brand__text">
            <strong>EQUIPESOM</strong>
            {!compact && <small>propostas e eventos</small>}
          </span>
        </Link>

        <div className="app-header__actions">
          <button className="icon-button desktop-only" type="button" aria-label="Ajuda">
            <HelpCircle size={20} />
          </button>
          <button className="icon-button" type="button" aria-label="Notificações">
            <Bell size={20} />
            <span className="notification-dot" />
          </button>
          <button className="avatar-button" type="button" aria-label="Abrir perfil de Camila">
            CA
          </button>
        </div>
      </div>
    </header>
  )
}
