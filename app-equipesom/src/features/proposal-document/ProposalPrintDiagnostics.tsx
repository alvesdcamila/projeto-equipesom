import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProposalDocumentThemeId } from './types'

type DiagnosticPhase = 'screen' | 'beforeprint' | 'print-media' | 'afterprint' | 'manual'

interface ProposalPrintDiagnosticsProps {
  activeTest?: 'B' | 'C'
  enabled: boolean
  paginationStatus: 'error' | 'measuring' | 'stable'
  themeId: ProposalDocumentThemeId
}

interface DiagnosticSnapshot {
  capturedAt: string
  phase: DiagnosticPhase
  [key: string]: unknown
}

const styleProperties = [
  'display',
  'visibility',
  'opacity',
  'boxSizing',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'gap',
  'rowGap',
  'columnGap',
  'overflow',
  'overflowX',
  'overflowY',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'transform',
  'breakBefore',
  'breakAfter',
  'breakInside',
  'pageBreakBefore',
  'pageBreakAfter',
  'pageBreakInside',
] as const

function round(value: number) {
  return Math.round(value * 1000) / 1000
}

function getRect(element: Element) {
  const rect = element.getBoundingClientRect()

  return {
    bottom: round(rect.bottom),
    height: round(rect.height),
    left: round(rect.left),
    right: round(rect.right),
    top: round(rect.top),
    width: round(rect.width),
  }
}

function getStyles(element: Element, pseudoElement?: '::before' | '::after') {
  const style = getComputedStyle(element, pseudoElement)
  const values = Object.fromEntries(styleProperties.map((property) => [property, style[property]]))

  return {
    ...values,
    content: pseudoElement ? style.content : undefined,
    zoom: style.getPropertyValue('zoom') || 'normal',
  }
}

function isEffectivelyHidden(element: Element) {
  let current: Element | null = element

  while (current) {
    const style = getComputedStyle(current)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return true
    }
    current = current.parentElement
  }

  return false
}

function describeElement(element: Element | null) {
  if (!element) return null

  const htmlElement = element as HTMLElement

  return {
    className: htmlElement.className || null,
    clientHeight: htmlElement.clientHeight,
    clientWidth: htmlElement.clientWidth,
    effectivelyHidden: isEffectivelyHidden(element),
    id: htmlElement.id || null,
    offsetHeight: htmlElement.offsetHeight,
    offsetWidth: htmlElement.offsetWidth,
    rect: getRect(element),
    scrollHeight: htmlElement.scrollHeight,
    scrollWidth: htmlElement.scrollWidth,
    styles: getStyles(element),
    tagName: element.tagName.toLowerCase(),
  }
}

function describePage(page: Element, index: number) {
  const footer = page.querySelector('.proposal-document__footer')
  const wrapper = page.parentElement
  const siblingElements = wrapper ? [...wrapper.children] : []

  return {
    domIndex: index,
    matchesLastChild: page.matches(':last-child'),
    pageNumber: page.getAttribute('data-page-number'),
    parentChildCount: siblingElements.length,
    parentChildIndex: siblingElements.indexOf(page),
    role: page.classList.contains('proposal-document__measurement-page') ? 'measurement' : 'printable',
    page: describeElement(page),
    immediateWrapper: describeElement(wrapper),
    before: getStyles(page, '::before'),
    after: getStyles(page, '::after'),
    footer: describeElement(footer),
  }
}

function captureSnapshot(
  phase: DiagnosticPhase,
  themeId: ProposalDocumentThemeId,
  paginationStatus: ProposalPrintDiagnosticsProps['paginationStatus'],
  activeTest?: 'B' | 'C',
): DiagnosticSnapshot {
  const allPages = [...document.querySelectorAll('.proposal-document__page')]
  const printablePages = [...document.querySelectorAll('.proposal-document__pages > .proposal-document__page')]
  const measurementPages = [...document.querySelectorAll('.proposal-document__measurement .proposal-document__page')]
  const documentViewport = document.querySelector('.proposal-document__viewport')
  const documentRoot = document.querySelector('.proposal-document')
  const pagesContainer = document.querySelector('.proposal-document__pages')
  const firstPrintablePage = printablePages[0]
  const hierarchy: Element[] = []
  let current: Element | null = firstPrintablePage ?? null

  while (current) {
    hierarchy.push(current)
    if (current === document.documentElement) break
    current = current.parentElement
  }

  return {
    activeTest: activeTest ?? 'baseline',
    capturedAt: new Date().toISOString(),
    devicePixelRatio: window.devicePixelRatio,
    media: {
      print: window.matchMedia('print').matches,
      screen: window.matchMedia('screen').matches,
    },
    pageCounts: {
      allInDom: allPages.length,
      effectivelyHiddenInDom: allPages.filter(isEffectivelyHidden).length,
      measurement: measurementPages.length,
      printable: printablePages.length,
      printableEffectivelyHidden: printablePages.filter(isEffectivelyHidden).length,
    },
    pages: allPages.map(describePage),
    paginationStatus,
    phase,
    printGeometry: {
      document: describeElement(documentRoot),
      pages: printablePages.map(describeElement),
      pagesContainer: describeElement(pagesContainer),
      viewport: describeElement(documentViewport),
    },
    printPlatform: documentViewport?.getAttribute('data-print-platform') ?? 'default',
    rootHierarchyFromFirstPrintablePage: hierarchy.map(describeElement),
    themeId,
    userAgent: navigator.userAgent,
    viewport: {
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      visualViewport: window.visualViewport
        ? {
            height: round(window.visualViewport.height),
            offsetLeft: round(window.visualViewport.offsetLeft),
            offsetTop: round(window.visualViewport.offsetTop),
            scale: window.visualViewport.scale,
            width: round(window.visualViewport.width),
          }
        : null,
    },
  }
}

export function ProposalPrintDiagnostics({
  activeTest,
  enabled,
  paginationStatus,
  themeId,
}: ProposalPrintDiagnosticsProps) {
  const [snapshots, setSnapshots] = useState<DiagnosticSnapshot[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const outputRef = useRef<HTMLPreElement>(null)

  const capture = useCallback((phase: DiagnosticPhase) => {
    if (!enabled) return
    const snapshot = captureSnapshot(phase, themeId, paginationStatus, activeTest)
    setSnapshots((current) => [...current.slice(-3), snapshot])
  }, [activeTest, enabled, paginationStatus, themeId])

  useEffect(() => {
    if (!enabled || paginationStatus !== 'stable') return
    const frame = window.requestAnimationFrame(() => capture('screen'))
    return () => window.cancelAnimationFrame(frame)
  }, [capture, enabled, paginationStatus])

  useEffect(() => {
    if (!enabled) return

    const printMedia = window.matchMedia('print')
    const handleBeforePrint = () => capture('beforeprint')
    const handleAfterPrint = () => capture('afterprint')
    const handlePrintMedia = (event: MediaQueryListEvent) => {
      if (event.matches) capture('print-media')
    }

    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    printMedia.addEventListener?.('change', handlePrintMedia)

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
      printMedia.removeEventListener?.('change', handlePrintMedia)
    }
  }, [capture, enabled])

  if (!enabled) return null

  const diagnosticText = JSON.stringify({ snapshots }, null, 2)
  const diagnosticMode = activeTest === 'B'
    ? 'Teste B — pseudo-elementos do Verão desativados'
    : activeTest === 'C'
      ? 'Teste C — quebras explícitas desativadas'
      : 'A — configuração normal'

  const copyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticText)
      setCopyStatus('Diagnóstico copiado.')
    } catch {
      const range = document.createRange()
      const selection = window.getSelection()
      if (outputRef.current && selection) {
        range.selectNodeContents(outputRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
        setCopyStatus('Texto selecionado. Use Copiar no menu do navegador.')
      } else {
        setCopyStatus('Não foi possível copiar automaticamente.')
      }
    }
  }

  return (
    <section className="proposal-print-debug" aria-labelledby="proposal-print-debug-title">
      <div className="proposal-print-debug__heading">
        <div>
          <span className="eyebrow">Diagnóstico temporário Safari/iOS</span>
          <h2 id="proposal-print-debug-title">Geometria real da proposta</h2>
          <p>
            Modo {diagnosticMode}.
            Nenhum dado é salvo no rascunho ou no localStorage.
          </p>
        </div>
        <div className="proposal-print-debug__actions">
          <button type="button" className="button button--secondary" onClick={() => capture('manual')}>
            Atualizar medição
          </button>
          <button type="button" className="button button--primary" onClick={copyDiagnostics}>
            Copiar diagnóstico
          </button>
        </div>
      </div>
      {copyStatus && <p className="proposal-print-debug__copy-status" role="status">{copyStatus}</p>}
      <pre ref={outputRef} tabIndex={0}>{diagnosticText}</pre>
    </section>
  )
}
