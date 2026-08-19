import { FileText, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RecentProposalList } from '../components/dashboard/RecentProposalList'
import { getDisplayedProposals } from '../services/proposalRepository'
import type { ProposalStatus } from '../types/domain'

type ProposalFilter = 'todas' | ProposalStatus

const filters: Array<{ value: ProposalFilter; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'rascunho', label: 'Rascunhos' },
  { value: 'enviada', label: 'Enviadas' },
  { value: 'aceita', label: 'Aceitas' },
]

export function ProposalsPage() {
  const [activeFilter, setActiveFilter] = useState<ProposalFilter>('todas')
  const proposals = getDisplayedProposals()
  const filteredProposals = useMemo(
    () => activeFilter === 'todas'
      ? proposals
      : proposals.filter((proposal) => proposal.status === activeFilter),
    [activeFilter, proposals],
  )

  return (
    <div className="page standard-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Organização comercial</span>
          <h1>Propostas</h1>
          <p>Rascunhos, envios e versões reunidos em um só lugar.</p>
        </div>
        <Link className="button button--primary" to="/propostas/nova">
          <Plus size={18} /> Nova proposta
        </Link>
      </div>
      <div className="filter-bar" aria-label="Filtros de propostas">
        {filters.map((filter) => (
          <button
            className={activeFilter === filter.value ? 'filter-chip is-active' : 'filter-chip'}
            type="button"
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
          >
            {filter.label}
            <span>{filter.value === 'todas' ? proposals.length : proposals.filter((proposal) => proposal.status === filter.value).length}</span>
          </button>
        ))}
      </div>
      <RecentProposalList proposals={filteredProposals} showHeading={false} />
      <div className="inline-notice">
        <FileText size={20} />
        <p>O histórico completo e as ações por versão serão definidos após a validação do modelo de dados.</p>
      </div>
    </div>
  )
}
