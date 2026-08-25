import { ArrowLeft, FileQuestion } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProposalDocumentPreview } from '../features/proposal-document/ProposalDocumentPreview'
import { canPreviewProposal, createProposalDocumentData } from '../features/proposal-document/proposalDocumentMapper'
import { proposalDocumentThemes } from '../features/proposal-document/themes'
import type { ProposalDocumentThemeId } from '../features/proposal-document/types'
import {
  createProposalDocumentPlaceDate,
  createProposalPreviewSession,
} from '../features/proposal-document/documentDate'
import { getProposalById } from '../services/proposalRepository'
import '../features/proposal-document/proposal-document.css'

export function ProposalPreviewPage() {
  const { proposalId = '' } = useParams()
  const proposal = getProposalById(decodeURIComponent(proposalId))
  const [themeId, setThemeId] = useState<ProposalDocumentThemeId>('tecnico-litoraneo')
  const [previewSession] = useState(createProposalPreviewSession)
  const documentData = proposal?.version.snapshot
    ? createProposalDocumentData(proposal.version.snapshot)
    : null
  const placeDate = documentData
    ? createProposalDocumentPlaceDate(documentData.issuer, {
      kind: 'preview',
      viewedAt: previewSession.openedAt,
    })
    : null

  if (!proposal || !canPreviewProposal(proposal) || !documentData || !placeDate) {
    return (
      <div className="page standard-page proposal-preview__unavailable">
        <section className="placeholder-card">
          <div className="placeholder-card__icon"><FileQuestion size={28} /></div>
          <span className="eyebrow">Laboratório visual</span>
          <h1>Prévia indisponível</h1>
          <p>A prévia está disponível somente para rascunhos locais com fotografia completa.</p>
          <Link className="button button--secondary" to={proposal ? `/propostas/${encodeURIComponent(proposal.id)}` : '/propostas'}>
            <ArrowLeft size={18} /> Voltar
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="proposal-preview">
      <div className="proposal-preview__workspace">
        <header className="proposal-preview__toolbar">
          <Link className="proposal-preview__back" to={`/propostas/${encodeURIComponent(proposal.id)}`}>
            <ArrowLeft size={18} /> Voltar aos detalhes
          </Link>
          <div>
            <span className="eyebrow">Laboratório visual</span>
            <h1>Compare a apresentação da proposta</h1>
            <p>Compare as duas direções de cor com os mesmos dados e a mesma composição.</p>
          </div>
        </header>

        <aside className="proposal-preview__notice" role="note">
          Prévia visual não emitida. Cores e composição ainda estão em validação.
        </aside>

        <div className="proposal-preview__selector-block">
          <div className="proposal-preview__selector-heading">
            <div><h2>Direção de cor</h2><p>Compare clima, contraste e presença comercial.</p></div>
          </div>
          <section className="proposal-preview__themes" aria-label="Direções de cor">
            {proposalDocumentThemes.map((theme) => (
              <button
                type="button"
                className={`proposal-preview__theme${theme.id === themeId ? ' is-selected' : ''}`}
                aria-pressed={theme.id === themeId}
                key={theme.id}
                onClick={() => setThemeId(theme.id)}
              >
                <span className="proposal-preview__option-heading">
                  <strong>{theme.name}</strong>
                </span>
                <span className="proposal-preview__swatches" aria-hidden="true">
                  {[theme.tokens.ink, theme.tokens.accent, theme.tokens.soft, theme.tokens.paper]
                    .map((color) => <i key={color} style={{ backgroundColor: color }} />)}
                </span>
                <span>{theme.description}</span>
              </button>
            ))}
          </section>
        </div>
      </div>

      <ProposalDocumentPreview
        data={documentData}
        themeId={themeId}
        placeDate={placeDate}
      />
    </div>
  )
}
