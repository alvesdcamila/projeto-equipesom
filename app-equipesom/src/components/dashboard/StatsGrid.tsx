import { CalendarCheck, FileCheck2, FileClock } from 'lucide-react'
import type { ProposalStats } from '../../services/proposalRepository'

interface StatsGridProps {
  stats: ProposalStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    {
      label: 'Rascunhos',
      value: stats.drafts,
    icon: FileClock,
    className: 'stat-card--sand',
    },
    {
      label: 'Enviadas',
      value: stats.sent,
    icon: FileCheck2,
    className: 'stat-card--aqua',
    },
    {
      label: 'Próximos eventos',
      value: stats.upcomingEvents,
    icon: CalendarCheck,
    className: 'stat-card--coral',
    },
  ]

  return (
    <section className="stats-grid" aria-label="Resumo das propostas e eventos">
      {items.map(({ label, value, icon: Icon, className }) => (
        <article className={`stat-card ${className}`} key={label}>
          <div className="stat-card__icon">
            <Icon size={19} />
          </div>
          <strong>{value}</strong>
          <span>{label}</span>
        </article>
      ))}
    </section>
  )
}
