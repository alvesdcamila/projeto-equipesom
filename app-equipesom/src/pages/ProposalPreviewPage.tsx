import { ArrowLeft, FileCheck2, FileQuestion, LockKeyhole, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ProposalDocumentPreview,
  type ProposalDocumentPaginationState,
} from '../features/proposal-document/ProposalDocumentPreview'
import { ProposalPrintDiagnostics } from '../features/proposal-document/ProposalPrintDiagnostics'
import { canOpenProposalDocument, createProposalDocumentData } from '../features/proposal-document/proposalDocumentMapper'
import { proposalDocumentThemes } from '../features/proposal-document/themes'
import type { ProposalDocumentThemeId } from '../features/proposal-document/types'
import {
  createProposalDocumentPlaceDate,
  createProposalPreviewSession,
} from '../features/proposal-document/documentDate'
import {
  createProposalPrintTitle,
  printProposalDocument,
} from '../features/proposal-document/previewPrint'
import { getProposalById } from '../services/proposalRepository'
import { issueProposal } from '../services/prototypeStorage'
import '../features/proposal-document/proposal-document.css'

export function ProposalPreviewPage() {
  const { proposalId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const printDebugEnabled = searchParams.get('printDebug') === '1'
  const requestedPrintTest = searchParams.get('printTest')?.toUpperCase()
  const printDebugTest = printDebugEnabled && (requestedPrintTest === 'B' || requestedPrintTest === 'C')
    ? requestedPrintTest
    : undefined
  const initialProposal = useMemo(
    () => getProposalById(decodeURIComponent(proposalId)),
    [proposalId],
  )
  const [proposal, setProposal] = useState(initialProposal)
  const [themeId, setThemeId] = useState<ProposalDocumentThemeId>(
    initialProposal?.version.documentThemeId ?? 'tecnico-litoraneo',
  )
  const [actionFeedback, setActionFeedback] = useState('')
  const [previewSession] = useState(createProposalPreviewSession)
  const [paginationState, setPaginationState] = useState<ProposalDocumentPaginationState>({
    status: 'measuring',
    pageCount: 0,
  })
  const documentData = useMemo(
    () => proposal?.version.snapshot
      ? createProposalDocumentData(proposal.version.snapshot, {
        presentationContext: proposal.status === 'rascunho' ? 'documentPreview' : 'emittedDocument',
        proposalNumber: proposal.version.proposalNumber,
        versionNumber: proposal.version.versionNumber,
        issuedAt: proposal.version.issuedAt,
      })
      : null,
    [proposal],
  )
  const placeDate = useMemo(
    () => documentData
      ? createProposalDocumentPlaceDate(
        documentData.issuer,
        proposal?.version.issuedAt
          ? { kind: 'emitted', issuedAt: proposal.version.issuedAt }
          : { kind: 'preview', viewedAt: previewSession.openedAt },
      )
      : null,
    [documentData, previewSession.openedAt, proposal],
  )
  const printTitle = useMemo(
    () => documentData
      ? createProposalPrintTitle(
        documentData.client.name,
        proposal?.version.issuedAt ? new Date(proposal.version.issuedAt) : previewSession.openedAt,
        proposal?.version.proposalNumber,
      )
      : '',
    [documentData, previewSession.openedAt, proposal],
  )
  const paginationReady = paginationState.status === 'stable' && paginationState.pageCount > 0
  const isDraft = proposal?.status === 'rascunho'

  const handleIssue = () => {
    if (!proposal || !isDraft || !paginationReady) return
    const issued = issueProposal(proposal.id, themeId)
    if (!issued) {
      setActionFeedback('Não foi possível emitir a proposta neste navegador. O rascunho foi preservado.')
      return
    }
    setProposal(issued)
    setThemeId(issued.version.documentThemeId ?? themeId)
    setActionFeedback(`Proposta ${issued.version.proposalNumber} emitida. Esta versão agora é imutável e pode ser salva em PDF.`)
  }

  if (!proposal || !canOpenProposalDocument(proposal) || !documentData || !placeDate) {
    return (
      <div className="page standard-page proposal-preview__unavailable">
        <section className="placeholder-card">
          <div className="placeholder-card__icon"><FileQuestion size={28} /></div>
          <span className="eyebrow">Documento comercial</span>
          <h1>Documento indisponível</h1>
          <p>O documento está disponível para rascunhos locais completos e versões emitidas por este navegador.</p>
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
            <span className="eyebrow">Documento comercial</span>
            <h1>{isDraft ? 'Revise e emita a proposta' : proposal.version.proposalNumber}</h1>
            <p>{isDraft
              ? 'Confira conteúdo e apresentação antes de tornar esta versão imutável.'
              : 'Versão emitida, pronta para imprimir ou salvar em PDF.'}</p>
          </div>
        </header>

        <aside className={`proposal-preview__notice${isDraft ? '' : ' is-issued'}`} role="status">
          {isDraft
            ? 'Antes de emitir, confira cliente, evento, escopo, valores, condições e a direção de cor. A emissão atribui número e data e bloqueia novas edições desta versão.'
            : <><LockKeyhole size={16} /> Esta proposta foi emitida e está protegida contra alterações.</>}
        </aside>

        <section className="proposal-preview__print-panel" aria-labelledby="proposal-preview-print-title">
          <div>
            <h2 id="proposal-preview-print-title">{isDraft ? 'Emissão da proposta' : 'PDF da proposta'}</h2>
            <p id="proposal-preview-print-help">
              {paginationReady
                ? `Paginação pronta em ${paginationState.pageCount} ${paginationState.pageCount === 1 ? 'página' : 'páginas'}.`
                : paginationState.status === 'error'
                  ? paginationState.errorMessage
                  : 'Aguarde a paginação terminar antes de abrir a impressão.'}
              {' '}{isDraft
                ? 'Ao emitir, esta versão receberá número e data oficiais neste protótipo local.'
                : 'No computador, use Chrome ou Edge e escolha “Salvar como PDF”, papel A4, escala 100% e cabeçalhos e rodapés desativados. O texto será preservado em alta nitidez. O navegador controla o nome final.'}
            </p>
            {!isDraft && <span className="proposal-preview__suggested-file">Nome sugerido: {printTitle}.pdf</span>}
            {actionFeedback && <span className="proposal-preview__action-feedback" role="status">{actionFeedback}</span>}
          </div>
          <div className="proposal-preview__print-actions">
            {paginationState.status === 'error' && paginationState.retry && (
              <button
                type="button"
                className="button button--secondary"
                onClick={paginationState.retry}
              >
                Tentar paginação novamente
              </button>
            )}
            <button
              type="button"
              className="button button--primary proposal-preview__print-button"
              aria-describedby="proposal-preview-print-help"
              disabled={!paginationReady}
              onClick={isDraft ? handleIssue : () => printProposalDocument(printTitle)}
            >
              {isDraft ? <FileCheck2 size={18} /> : <Printer size={18} />}
              {isDraft ? 'Emitir proposta' : 'Imprimir ou salvar PDF'}
            </button>
          </div>
        </section>

        {isDraft && <div className="proposal-preview__selector-block">
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
                onClick={() => {
                  setPaginationState((current) => ({ ...current, status: 'measuring' }))
                  setThemeId(theme.id)
                }}
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
        </div>}
      </div>

      <ProposalDocumentPreview
        data={documentData}
        themeId={themeId}
        placeDate={placeDate}
        onPaginationStateChange={setPaginationState}
        printDebugTest={printDebugTest}
      />
      <ProposalPrintDiagnostics
        activeTest={printDebugTest}
        enabled={printDebugEnabled}
        paginationStatus={paginationState.status}
        themeId={themeId}
      />
    </div>
  )
}
