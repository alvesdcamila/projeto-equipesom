import { CalendarDays, CircleDollarSign, Info, UserRound } from 'lucide-react'
import type { ProposalVersion } from '../../types/domain'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { DetailSection } from './DetailSection'

export function ProposalLegacyDetails({ version }: { version: ProposalVersion }) {
  return (
    <div className="proposal-detail__sections">
      <div className="legacy-detail-notice" role="note">
        <Info size={20} />
        <p><strong>Informações resumidas</strong>Os detalhes completos não foram registrados nesta versão do protótipo.</p>
      </div>
      <DetailSection eyebrow="Dado disponível" title="Cliente" icon={<UserRound size={20} />}>
        <div className="detail-grid"><div className="detail-value"><span>Nome</span><strong>{version.clientName}</strong></div></div>
      </DetailSection>
      <DetailSection eyebrow="Dado disponível" title="Evento" icon={<CalendarDays size={20} />}>
        <div className="detail-grid">
          <div className="detail-value"><span>Evento</span><strong>{version.eventName}</strong></div>
          <div className="detail-value"><span>Data</span><strong>{formatDate(version.eventDate)}</strong></div>
        </div>
      </DetailSection>
      <DetailSection eyebrow="Dado disponível" title="Valor" icon={<CircleDollarSign size={20} />}>
        <div className="detail-grid"><div className="detail-value"><span>Total registrado</span><strong>{formatCurrency(version.total)}</strong></div></div>
      </DetailSection>
    </div>
  )
}
