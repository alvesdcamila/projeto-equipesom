import { useEffect, useMemo, type CSSProperties } from 'react'
import { proposalPresentation } from '../../config/proposalPresentation'
import {
  DocumentContinuationHeader,
  DocumentPageFooter,
} from './ProposalDocumentBlocks'
import { ProposalDocumentPaginationBlockView } from './ProposalDocumentPaginationBlock'
import {
  createProposalDocumentPaginationBlocks,
  type ProposalDocumentPaginationBlock,
} from './proposalDocumentPaginationBlocks'
import { detectProposalPrintPlatform } from './printPlatform'
import { getProposalDocumentTheme } from './themes'
import type {
  ProposalDocumentData,
  ProposalDocumentPlaceDate,
  ProposalDocumentThemeId,
} from './types'
import { useProposalDocumentPagination } from './useProposalDocumentPagination'

interface ProposalDocumentPreviewProps {
  data: ProposalDocumentData
  themeId: ProposalDocumentThemeId
  placeDate: ProposalDocumentPlaceDate
  onPaginationStateChange?: (state: ProposalDocumentPaginationState) => void
  printDebugTest?: 'B' | 'C'
}

export interface ProposalDocumentPaginationState {
  errorMessage?: string
  pageCount: number
  retry?: () => void
  status: 'error' | 'measuring' | 'stable'
}

type DocumentStyle = CSSProperties & {
  '--document-ink': string
  '--document-accent': string
  '--document-soft': string
  '--document-paper': string
}

interface PaginationBlockListProps {
  blocks: ProposalDocumentPaginationBlock[]
  data: ProposalDocumentData
  measurement?: boolean
  placeDate: ProposalDocumentPlaceDate
}

function PaginationBlockList({
  blocks,
  data,
  measurement = false,
  placeDate,
}: PaginationBlockListProps) {
  return blocks.map((block) => (
    <div
      className={`proposal-document__pagination-block proposal-document__pagination-block--${block.kind}`}
      data-measure-block-id={measurement ? block.id : undefined}
      data-pagination-block-id={measurement ? undefined : block.id}
      key={block.id}
    >
      <ProposalDocumentPaginationBlockView block={block} data={data} placeDate={placeDate} />
    </div>
  ))
}

export function ProposalDocumentPreview({
  data,
  themeId,
  placeDate,
  onPaginationStateChange,
  printDebugTest,
}: ProposalDocumentPreviewProps) {
  const theme = getProposalDocumentTheme(themeId)
  const printPlatform = useMemo(() => detectProposalPrintPlatform(), [])
  const blocks = useMemo(() => createProposalDocumentPaginationBlocks(data), [data])
  const blockById = useMemo(
    () => new Map(blocks.map((block) => [block.id, block])),
    [blocks],
  )
  const {
    documentRef,
    measurementContinuationRef,
    measurementFlowRef,
    measurementFooterRef,
    measurementPageRef,
    errorMessage,
    pages,
    retryPagination,
    status,
  } = useProposalDocumentPagination({
    blocks,
    recalculationKey: themeId,
  })
  const style: DocumentStyle = {
    '--document-ink': theme.tokens.ink,
    '--document-accent': theme.tokens.accent,
    '--document-soft': theme.tokens.soft,
    '--document-paper': theme.tokens.paper,
  }
  const totalPages = pages.length
  const documentIdentification = proposalPresentation[data.presentationContext].identification
    ?? (data.issuedIdentification
      ? `${data.issuedIdentification.proposalNumber} · ${data.issuedIdentification.versionLabel}`
      : undefined)

  useEffect(() => {
    onPaginationStateChange?.({
      errorMessage,
      pageCount: totalPages,
      retry: retryPagination,
      status,
    })
  }, [errorMessage, onPaginationStateChange, retryPagination, status, totalPages])

  const identification = documentIdentification
    ? <span className="proposal-document__identification">{documentIdentification}</span>
    : null

  return (
    <div className="proposal-document__viewport" data-print-platform={printPlatform}>
      <div
        className="proposal-document"
        data-page-count={totalPages}
        data-pagination-status={status}
        data-presentation-context={data.presentationContext}
        data-print-debug-test={printDebugTest}
        data-theme={theme.id}
        ref={documentRef}
        style={style}
      >
        <div className={`proposal-document__pagination-status${status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
          <span>
            {status === 'stable'
              ? `Paginação estabilizada · ${totalPages} ${totalPages === 1 ? 'página' : 'páginas'}`
              : status === 'error'
                ? errorMessage
                : 'Calculando paginação…'}
          </span>
          {status === 'error' && (
            <button type="button" onClick={retryPagination}>Tentar novamente</button>
          )}
        </div>

        <div className="proposal-document__measurement" aria-hidden="true">
          <article className="proposal-document__page proposal-document__measurement-page" ref={measurementPageRef}>
            <div className="proposal-document__page-content">
              <div ref={measurementContinuationRef}>
                <DocumentContinuationHeader
                  issuerBrandName={data.issuer.brandName}
                  documentIdentification={documentIdentification}
                />
              </div>
              <div className="proposal-document__page-flow" ref={measurementFlowRef}>
                <PaginationBlockList blocks={blocks} data={data} measurement placeDate={placeDate} />
              </div>
            </div>
            <div ref={measurementFooterRef}>
              <DocumentPageFooter
                issuerBrandName={data.issuer.brandName}
                issuedIdentification={data.issuedIdentification}
                page={1}
                totalPages={totalPages}
              />
            </div>
          </article>
        </div>

        <div className="proposal-document__pages">
          {pages.map((page, pageIndex) => {
            const pageBlocks = page.blockIds
              .map((blockId) => blockById.get(blockId))
              .filter((block): block is ProposalDocumentPaginationBlock => Boolean(block))

            return (
              <article
                className="proposal-document__page"
                data-page-number={pageIndex + 1}
                data-page-overflow={page.overflowed ? 'true' : 'false'}
                key={`${pageIndex}-${page.blockIds.join('-')}`}
              >
                {pageIndex === 0 && identification}
                <div className="proposal-document__page-content">
                  {pageIndex > 0 && (
                    <DocumentContinuationHeader
                      issuerBrandName={data.issuer.brandName}
                      documentIdentification={documentIdentification}
                    />
                  )}
                  <div className="proposal-document__page-flow">
                    <PaginationBlockList blocks={pageBlocks} data={data} placeDate={placeDate} />
                  </div>
                </div>
                <DocumentPageFooter
                  issuerBrandName={data.issuer.brandName}
                  issuedIdentification={data.issuedIdentification}
                  page={pageIndex + 1}
                  totalPages={totalPages}
                />
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
