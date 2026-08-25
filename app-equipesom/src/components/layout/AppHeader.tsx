import { Bell, HelpCircle, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeaderHelpPanel } from './header/HeaderHelpPanel'
import { HeaderNotificationsPanel } from './header/HeaderNotificationsPanel'
import { HeaderPanel } from './header/HeaderPanel'
import { HeaderProfilePanel } from './header/HeaderProfilePanel'
import { useHeaderPanels, type HeaderPanelId } from './header/useHeaderPanels'

interface AppHeaderProps {
  compact?: boolean
}

export function AppHeader({ compact = false }: AppHeaderProps) {
  const {
    actionsRef,
    closePanel,
    openPanel,
    panelRef,
    togglePanel,
  } = useHeaderPanels()

  const panelConfiguration: Record<HeaderPanelId, { panelId: string; titleId: string }> = {
    help: { panelId: 'header-help-panel', titleId: 'header-help-title' },
    notifications: { panelId: 'header-notifications-panel', titleId: 'header-notifications-title' },
    profile: { panelId: 'header-profile-panel', titleId: 'header-profile-title' },
  }

  const activePanel = openPanel ? panelConfiguration[openPanel] : null

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

        <div className="app-header__actions" ref={actionsRef}>
          <button
            aria-controls="header-help-panel"
            aria-expanded={openPanel === 'help'}
            aria-haspopup="dialog"
            aria-label="Abrir ajuda rápida"
            className="icon-button"
            onClick={(event) => togglePanel('help', event.currentTarget)}
            type="button"
          >
            <HelpCircle size={20} />
          </button>
          <button
            aria-controls="header-notifications-panel"
            aria-expanded={openPanel === 'notifications'}
            aria-haspopup="dialog"
            aria-label="Abrir notificações"
            className="icon-button"
            onClick={(event) => togglePanel('notifications', event.currentTarget)}
            type="button"
          >
            <Bell size={20} />
          </button>
          <button
            aria-controls="header-profile-panel"
            aria-expanded={openPanel === 'profile'}
            aria-haspopup="dialog"
            aria-label="Abrir perfil de Camila"
            className="avatar-button"
            onClick={(event) => togglePanel('profile', event.currentTarget)}
            type="button"
          >
            CA
          </button>

          {activePanel && (
            <HeaderPanel
              id={activePanel.panelId}
              labelledBy={activePanel.titleId}
              ref={panelRef}
            >
              {openPanel === 'help' && <HeaderHelpPanel onNavigate={() => closePanel()} />}
              {openPanel === 'notifications' && <HeaderNotificationsPanel />}
              {openPanel === 'profile' && <HeaderProfilePanel onNavigate={() => closePanel()} />}
            </HeaderPanel>
          )}
        </div>
      </div>
    </header>
  )
}
