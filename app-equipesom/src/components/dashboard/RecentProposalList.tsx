import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProposalListItem, ProposalStatus } from '../../types/domain'
import { formatCurrency, formatDate } from '../../utils/formatters'

const statusLabels: Record<ProposalStatus, string> = {
  rascunho: 'Rascunho',
  emitida: 'Emitida',
  enviada: 'Enviada',
  aceita: 'Aceita',
}

interface RecentProposalListProps {
  proposals: ProposalListItem[]
  showHeading?: boolean
}

export function RecentProposalList({ proposals, showHeading = true }: RecentProposalListProps) {
  return (
    <section className="content-section">
      {showHeading && (
        <div className="section-heading">
          <div>
            <span className="eyebrow">Acompanhe de perto</span>
            <h2>Propostas recentes</h2>
          </div>
          <Link className="text-link" to="/propostas">
            Ver todas <ArrowUpRight size={16} />
          </Link>
        </div>
      )}

      <div className="proposal-list">
        {proposals.length === 0 && (
          <div className="proposal-list__empty">Nenhuma proposta encontrada neste filtro.</div>
        )}
        {proposals.map((proposal) => (
          <Link className="proposal-row" to={`/propostas/${encodeURIComponent(proposal.id)}`} key={proposal.id}>
            <div className="proposal-row__main">
              <div className="proposal-row__topline">
                <span className={`status-pill status-pill--${proposal.status}`}>
                  {statusLabels[proposal.status]}
                </span>
                <span className={`source-pill source-pill--${proposal.source}`}>
                  {proposal.source === 'local' ? 'Salvo localmente' : 'Demonstração'}
                </span>
                <span>{proposal.version.proposalNumber ?? `#${proposal.id.replace('prop-', '')}`} · v{proposal.version.versionNumber}</span>
              </div>
              <h3>{proposal.version.eventName}</h3>
              <p>{proposal.version.clientName}</p>
            </div>
            <div className="proposal-row__meta">
              <strong>{formatCurrency(proposal.version.total)}</strong>
              <span>{formatDate(proposal.version.eventDate)}</span>
            </div>
            <ChevronRight className="proposal-row__chevron" size={19} />
          </Link>
        ))}
      </div>
    </section>
  )
}
