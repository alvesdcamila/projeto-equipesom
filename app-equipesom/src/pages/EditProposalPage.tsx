import { ArrowLeft, FileWarning, PencilLine } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ProposalWizard } from '../features/proposals/ProposalWizard'
import { getProposalById } from '../services/proposalRepository'
import { isProposalEditable } from '../services/prototypeStorage'

export function EditProposalPage() {
  const { proposalId = '' } = useParams()
  const decodedProposalId = decodeURIComponent(proposalId)
  const proposal = getProposalById(decodedProposalId)

  if (!proposal || !isProposalEditable(proposal)) {
    let reason = 'Esta proposta não está disponível para edição.'
    if (proposal?.source === 'demonstrativo') reason = 'Conteúdos demonstrativos não podem ser editados.'
    else if (proposal && proposal.status !== 'rascunho') reason = 'Esta versão é imutável porque não está mais em rascunho.'
    else if (proposal && !proposal.version.snapshot) reason = 'Os detalhes completos não foram registrados e o rascunho não pode ser reconstruído.'

    return (
      <div className="page standard-page">
        <section className="placeholder-card">
          <div className="placeholder-card__icon"><FileWarning size={28} /></div>
          <span className="eyebrow">Edição indisponível</span>
          <h1>Rascunho protegido</h1>
          <p>{reason}</p>
          <Link className="button button--secondary" to={proposal ? `/propostas/${encodeURIComponent(proposal.id)}` : '/propostas'}>
            <ArrowLeft size={18} /> Voltar
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page wizard-page">
      <div className="wizard-page__title">
        <Link className="back-link" to={`/propostas/${encodeURIComponent(proposal.id)}`} aria-label="Voltar ao detalhe">
          <ArrowLeft size={19} />
        </Link>
        <div>
          <span className="eyebrow">Rascunho local</span>
          <h1>Editar proposta</h1>
        </div>
        <div className="prototype-badge"><PencilLine size={15} /> Edição</div>
      </div>
      <ProposalWizard editingProposalId={proposal.id} />
    </div>
  )
}
