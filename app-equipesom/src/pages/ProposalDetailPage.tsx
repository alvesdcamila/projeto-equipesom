import { ArrowLeft, Eye, FileQuestion, FlaskConical, LockKeyhole, PencilLine } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ProposalLegacyDetails } from '../components/proposals/ProposalLegacyDetails'
import { ProposalSnapshotDetails } from '../components/proposals/ProposalSnapshotDetails'
import { getProposalById } from '../services/proposalRepository'
import type { ProposalStatus } from '../types/domain'
import { isProposalEditable } from '../services/prototypeStorage'
import { canPreviewProposal } from '../features/proposal-document/proposalDocumentMapper'

const statusLabels: Record<ProposalStatus, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aceita: 'Aceita',
}

export function ProposalDetailPage() {
  const { proposalId = '' } = useParams()
  const proposal = getProposalById(decodeURIComponent(proposalId))

  if (!proposal) {
    return (
      <div className="page standard-page">
        <section className="placeholder-card">
          <div className="placeholder-card__icon"><FileQuestion size={28} /></div>
          <span className="eyebrow">Consulta</span>
          <h1>Proposta não encontrada</h1>
          <p>Este identificador não está disponível para o tenant de demonstração.</p>
          <Link className="button button--secondary" to="/propostas"><ArrowLeft size={18} /> Voltar às propostas</Link>
        </section>
      </div>
    )
  }

  const editingAvailable = isProposalEditable(proposal)
  const previewAvailable = canPreviewProposal(proposal)
  const consultationNotice = proposal.source === 'demonstrativo'
    ? <><FlaskConical size={17} /> Conteúdo demonstrativo: esta proposta não pode ser editada.</>
    : proposal.status !== 'rascunho'
      ? <><LockKeyhole size={17} /> Esta versão está {proposal.status} e permanece imutável.</>
      : proposal.version.snapshot
        ? <><PencilLine size={17} /> Este rascunho local completo pode ser editado.</>
        : <><Eye size={17} /> Os detalhes completos não foram registrados; este rascunho não pode ser reconstruído.</>

  return (
    <div className="page proposal-detail-page">
      <Link className="proposal-detail__back" to="/propostas"><ArrowLeft size={18} /> Voltar às propostas</Link>

      <header className="proposal-detail__header">
        <div>
          <span className="eyebrow">Consulta da proposta</span>
          <h1>{proposal.version.eventName}</h1>
          <p>{proposal.version.clientName}</p>
        </div>
        <div className="proposal-detail__badges">
          <span className={`status-pill status-pill--${proposal.status}`}>{statusLabels[proposal.status]}</span>
          <span className={`source-pill source-pill--${proposal.source}`}>{proposal.source === 'local' ? 'Salvo localmente' : 'Demonstração'}</span>
        </div>
        <dl className="proposal-detail__identity">
          <div><dt>Identificador</dt><dd>{proposal.id}</dd></div>
          <div><dt>Versão</dt><dd>v{proposal.version.versionNumber}</dd></div>
        </dl>
        <div className="consultation-only">
          <span>{consultationNotice}</span>
          <div className="proposal-detail__actions">
            {previewAvailable && (
              <Link className="proposal-detail__preview" to={`/propostas/${encodeURIComponent(proposal.id)}/previa`}>
                <Eye size={16} /> Ver prévia visual
              </Link>
            )}
            {editingAvailable && (
              <Link className="proposal-detail__edit" to={`/propostas/${encodeURIComponent(proposal.id)}/editar`}>
                <PencilLine size={16} /> Editar rascunho
              </Link>
            )}
          </div>
        </div>
      </header>

      {proposal.version.snapshot
        ? (
          <ProposalSnapshotDetails
            snapshot={proposal.version.snapshot}
            presentationContext={proposal.status === 'rascunho' ? 'internalDraft' : 'emittedDocument'}
          />
        )
        : <ProposalLegacyDetails version={proposal.version} />}
    </div>
  )
}
