import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProfilePanelProps {
  onNavigate: () => void
}

const demonstrativeProfile = {
  name: 'Camila',
  role: 'Administrador',
  company: 'EQUIPESOM',
} as const

export function HeaderProfilePanel({ onNavigate }: HeaderProfilePanelProps) {
  return (
    <>
      <div className="header-panel__heading header-panel__profile-heading">
        <span className="header-panel__avatar" aria-hidden="true">CA</span>
        <div>
          <h2 id="header-profile-title">{demonstrativeProfile.name}</h2>
          <p>{demonstrativeProfile.role}</p>
        </div>
      </div>
      <dl className="header-panel__profile-summary">
        <div><dt>Empresa</dt><dd>{demonstrativeProfile.company}</dd></div>
      </dl>
      <Link className="header-panel__settings" to="/mais" onClick={onNavigate}>
        <Settings aria-hidden="true" size={18} />
        Configurações
      </Link>
      <p className="header-panel__session-note">Sessão demonstrativa do protótipo</p>
    </>
  )
}
