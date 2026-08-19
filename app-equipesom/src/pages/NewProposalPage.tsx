import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProposalWizard } from '../features/proposals/ProposalWizard'

export function NewProposalPage() {
  return (
    <div className="page wizard-page">
      <div className="wizard-page__title">
        <Link className="back-link" to="/" aria-label="Voltar ao início">
          <ArrowLeft size={19} />
        </Link>
        <div>
          <span className="eyebrow">Criação guiada</span>
          <h1>Nova proposta</h1>
        </div>
        <div className="prototype-badge"><Sparkles size={15} /> Protótipo</div>
      </div>
      <ProposalWizard />
    </div>
  )
}
