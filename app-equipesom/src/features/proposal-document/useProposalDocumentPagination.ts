import { useLayoutEffect, useRef, useState } from 'react'
import { paginateMeasuredBlocks, type PaginationPage } from './pagination'
import type { ProposalDocumentPaginationBlock } from './proposalDocumentPaginationBlocks'

type PaginationStatus = 'measuring' | 'stable'

interface PaginationState {
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

export function useProposalDocumentPagination({
  blocks,
  recalculationKey,
}: UseProposalDocumentPaginationOptions) {
  const documentRef = useRef<HTMLDivElement>(null)
  const measurementPageRef = useRef<HTMLElement>(null)
  const measurementFlowRef = useRef<HTMLDivElement>(null)
  const measurementFooterRef = useRef<HTMLDivElement>(null)
  const measurementContinuationRef = useRef<HTMLDivElement>(null)
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pages: [{
      blockIds: blocks.map((block) => block.id),
      capacity: Number.POSITIVE_INFINITY,
      overflowed: false,
      usedHeight: 0,
    }],
    status: 'measuring',
  }))

  useLayoutEffect(() => {
    let cancelled = false
    let animationFrame = 0
    let observedWidth = 0

    function measure() {
      const pageElement = measurementPageRef.current
      const flowElement = measurementFlowRef.current
      const footerElement = measurementFooterRef.current
      const continuationElement = measurementContinuationRef.current
      if (!pageElement || !flowElement || !footerElement || !continuationElement) return

      const pageWidth = pageElement.getBoundingClientRect().width
      if (pageWidth <= 0) return

      const pageStyles = window.getComputedStyle(pageElement)
      const flowStyles = window.getComputedStyle(flowElement)
      const a4PageHeight = pageWidth * (297 / 210)
      const verticalPadding = pixels(pageStyles.paddingTop) + pixels(pageStyles.paddingBottom)
      const footerHeight = footerElement.getBoundingClientRect().height
      const continuationHeight = continuationElement.getBoundingClientRect().height
      const gap = pixels(flowStyles.rowGap)
      const baseCapacity = Math.max(1, a4PageHeight - verticalPadding - footerHeight)
      const measuredBlocks = blocks.map((block) => {
        const element = flowElement.querySelector<HTMLElement>(`[data-measure-block-id="${block.id}"]`)
        return {
          id: block.id,
          height: element?.getBoundingClientRect().height ?? 0,
          keepWithNext: 'keepWithNext' in block && block.keepWithNext,
        }
      })
      const nextPages = paginateMeasuredBlocks(measuredBlocks, {
        firstPageCapacity: baseCapacity,
        continuationPageCapacity: Math.max(1, baseCapacity - continuationHeight - gap),
        gap,
      })

      if (cancelled) return
      setPagination((current) => ({
        pages: plansAreEqual(current.pages, nextPages) ? current.pages : nextPages,
        status: 'stable',
      }))
    }

    function scheduleMeasurement() {
      window.cancelAnimationFrame(animationFrame)
      setPagination((current) => current.status === 'measuring'
        ? current
        : { ...current, status: 'measuring' })
      animationFrame = window.requestAnimationFrame(measure)
    }

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(([entry]) => {
        const nextWidth = entry?.contentRect.width ?? 0
        if (Math.abs(nextWidth - observedWidth) < 0.5) return
        observedWidth = nextWidth
        scheduleMeasurement()
      })
    if (documentRef.current) resizeObserver?.observe(documentRef.current)
    window.addEventListener('beforeprint', scheduleMeasurement)
    window.addEventListener('resize', scheduleMeasurement)

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    void fontsReady.then(() => {
      if (!cancelled) scheduleMeasurement()
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      window.removeEventListener('beforeprint', scheduleMeasurement)
      window.removeEventListener('resize', scheduleMeasurement)
    }
  }, [blocks, recalculationKey])

  return {
    documentRef,
    measurementContinuationRef,
    measurementFlowRef,
    measurementFooterRef,
    measurementPageRef,
    pages: pagination.pages,
    status: pagination.status,
  }
}
