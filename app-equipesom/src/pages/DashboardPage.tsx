import { ArrowRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NextEventCard } from '../components/dashboard/NextEventCard'
import { RecentProposalList } from '../components/dashboard/RecentProposalList'
import { StatsGrid } from '../components/dashboard/StatsGrid'
import { getDisplayedProposals, getProposalStats } from '../services/proposalRepository'
import { formatLongDate } from '../utils/formatters'

export function DashboardPage() {
  const proposals = getDisplayedProposals()
  const stats = getProposalStats(proposals)

  return (
    <div className="page dashboard-page">
      <section className="welcome-section">
        <div className="welcome-copy">
          <span className="eyebrow">{formatLongDate(new Date())}</span>
          <h1>Olá, Camila.</h1>
          <p>Pronta para transformar o próximo evento em uma grande entrega?</p>
        </div>

        <Link className="primary-action" to="/propostas/nova">
          <span className="primary-action__icon">
            <Plus size={22} />
          </span>
          <span>
            <small>Comece por aqui</small>
            <strong>Nova proposta</strong>
          </span>
          <ArrowRight className="primary-action__arrow" size={20} />
        </Link>
      </section>

      <StatsGrid stats={stats} />

      <div className="dashboard-grid">
        <NextEventCard />
        <RecentProposalList proposals={proposals.slice(0, 4)} />
      </div>

      <p className="prototype-note">
        Conteúdo demonstrativo para validação do fluxo. Nenhuma disponibilidade ou condição comercial é confirmada por esta tela.
      </p>
    </div>
  )
}
