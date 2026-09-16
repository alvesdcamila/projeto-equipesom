import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { paginateMeasuredBlocks, type PaginationPage } from './pagination'
import type { ProposalDocumentPaginationBlock } from './proposalDocumentPaginationBlocks'

type PaginationStatus = 'error' | 'measuring' | 'stable'

interface PaginationState {
  errorMessage?: string
  pages: PaginationPage[]
  status: PaginationStatus
}

interface UseProposalDocumentPaginationOptions {
  blocks: ProposalDocumentPaginationBlock[]
  recalculationKey: string
}

function plansAreEqual(current: PaginationPage[], next: PaginationPage[]): boolean {
  return current.length === next.length && current.every((page, pageIndex) => {
    const nextPage = next[pageIndex]
    return page.overflowed === nextPage.overflowed
      && page.blockIds.length === nextPage.blockIds.length
      && page.blockIds.every((blockId, blockIndex) => blockId === nextPage.blockIds[blockIndex])
  })
}

function pixels(value: string): number {
  return Number.parseFloat(value) || 0
}

function waitForFonts(timeoutMs = 5_000): Promise<void> {
  if (!document.fonts) return Promise.resolve()

  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Tempo excedido ao carregar a fonte do documento.')), timeoutMs)
    }),
  ])
}

export function useProposalDocumentPagination({
  blocks,
  recalculationKey,
}: UseProposalDocumentPaginationOptions) {
  const documentRef = useRef<HTMLDivElement>(null)
  const measurementPageRef = useRef<HTMLElement>(null)
  const measurementFlowRef = useRef<HTMLDivElement>(null)
  const measurementFooterRef = useRef<HTMLDivElement>(null)
  const measurementContinuationRef = useRef<HTMLDivElement>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pages: [{
      blockIds: blocks.map((block) => block.id),
      capacity: Number.POSITIVE_INFINITY,
      overflowed: false,
      usedHeight: 0,
    }],
    status: 'measuring',
  }))
  const retryPagination = useCallback(() => {
    setRetryKey((current) => current + 1)
  }, [])

  useLayoutEffect(() => {
    let cancelled = false
    let animationFrame = 0

    function measure(): PaginationPage[] {
      const pageElement = measurementPageRef.current
      const flowElement = measurementFlowRef.current
      const footerElement = measurementFooterRef.current
      const continuationElement = measurementContinuationRef.current
      if (!pageElement || !flowElement || !footerElement || !continuationElement) {
        throw new Error('A estrutura de medição do documento não está disponível.')
      }

      const pageHeight = pageElement.getBoundingClientRect().height
      if (pageHeight <= 0) {
        throw new Error('A folha A4 não possui altura mensurável.')
      }

      const pageStyles = window.getComputedStyle(pageElement)
      const flowStyles = window.getComputedStyle(flowElement)
      const verticalPadding = pixels(pageStyles.paddingTop) + pixels(pageStyles.paddingBottom)
      const footerHeight = footerElement.getBoundingClientRect().height
      const continuationHeight = continuationElement.getBoundingClientRect().height
      const gap = pixels(flowStyles.rowGap)
      const baseCapacity = pageHeight - verticalPadding - footerHeight
      if (baseCapacity <= 0) {
        throw new Error('A área útil da folha A4 é inválida.')
      }
      const measuredBlocks = blocks.map((block) => {
        const element = flowElement.querySelector<HTMLElement>(`[data-measure-block-id="${block.id}"]`)
        const height = element?.getBoundingClientRect().height ?? 0
        if (height <= 0) {
          throw new Error(`O bloco ${block.id} não pôde ser medido.`)
        }
        return {
          id: block.id,
          height,
          keepWithNext: 'keepWithNext' in block && block.keepWithNext,
        }
      })
      return paginateMeasuredBlocks(measuredBlocks, {
        firstPageCapacity: baseCapacity,
        continuationPageCapacity: Math.max(1, baseCapacity - continuationHeight - gap),
        gap,
      })
    }

    async function calculatePagination() {
      let calculationFinished = false
      setPagination((current) => ({ ...current, errorMessage: undefined, status: 'measuring' }))

      try {
        await waitForFonts()
        if (cancelled) return

        await new Promise<void>((resolveFrame) => {
          animationFrame = window.requestAnimationFrame(() => resolveFrame())
        })
        if (cancelled) return

        const nextPages = measure()
        setPagination((current) => ({
          pages: plansAreEqual(current.pages, nextPages) ? current.pages : nextPages,
          status: 'stable',
        }))
        calculationFinished = true
      } catch {
        if (!cancelled) {
          setPagination((current) => ({
            ...current,
            errorMessage: 'Não foi possível calcular as páginas com segurança. Tente novamente.',
            status: 'error',
          }))
          calculationFinished = true
        }
      } finally {
        // A paginação nunca pode permanecer em carregamento depois de uma tentativa concluída.
        if (!cancelled && !calculationFinished) {
          setPagination((current) => ({
            ...current,
            errorMessage: 'O cálculo de páginas foi interrompido. Tente novamente.',
            status: 'error',
          }))
        }
      }
    }

    void calculatePagination()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
    }
  }, [blocks, recalculationKey, retryKey])

  return {
    documentRef,
    errorMessage: pagination.errorMessage,
    measurementContinuationRef,
    measurementFlowRef,
    measurementFooterRef,
    measurementPageRef,
    pages: pagination.pages,
    retryPagination,
    status: pagination.status,
  }
}
