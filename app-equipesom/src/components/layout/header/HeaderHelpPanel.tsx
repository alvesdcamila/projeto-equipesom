import { FilePlus2, ListChecks, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderHelpPanelProps {
  onNavigate: () => void
}

const quickLinks = [
  { label: 'Criar nova proposta', to: '/propostas/nova', icon: FilePlus2 },
  { label: 'Ver propostas', to: '/propostas', icon: ListChecks },
  { label: 'Configurações', to: '/mais', icon: Settings },
]

export function HeaderHelpPanel({ onNavigate }: HeaderHelpPanelProps) {
  return (
    <>
      <div className="header-panel__heading">
        <span className="eyebrow">Orientação</span>
        <h2 id="header-help-title">Ajuda rápida</h2>
      </div>
      <nav className="header-panel__links" aria-label="Atalhos de ajuda">
        {quickLinks.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to} onClick={onNavigate}>
            <Icon aria-hidden="true" size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <p className="header-panel__note">
        Rascunhos podem ser editados. A emissão cria uma versão que não poderá ser alterada.
      </p>
    </>
  )
}
