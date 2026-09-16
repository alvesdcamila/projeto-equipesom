const BRAZIL_TIME_ZONE = 'America/Sao_Paulo'

export interface PreviewPrintAdapter {
  getTitle: () => string
  setTitle: (title: string) => void
  print: () => void
}

function formatFileDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: BRAZIL_TIME_ZONE,
  }).formatToParts(date)
  const valueByType = new Map(parts.map((part) => [part.type, part.value]))
  return `${valueByType.get('year')}-${valueByType.get('month')}-${valueByType.get('day')}`
}

export function createProposalPrintTitle(
  clientName: string,
  documentDate: Date,
  proposalNumber?: string,
): string {
  const clientSegment = clientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('pt-BR')
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'CLIENTE'

  const numberSegment = proposalNumber?.replace(/[^A-Z0-9-]+/gi, '').toLocaleUpperCase('pt-BR')
  return `PROPOSTA-EQUIPESOM-${numberSegment ? `${numberSegment}-` : ''}${clientSegment}-${formatFileDate(documentDate)}`
}

export function printPreviewWithTitle(title: string, adapter: PreviewPrintAdapter): void {
  const originalTitle = adapter.getTitle()
  try {
    adapter.setTitle(title)
    adapter.print()
  } finally {
    adapter.setTitle(originalTitle)
  }
}

export function printProposalDocument(title: string): void {
  printPreviewWithTitle(title, {
    getTitle: () => document.title,
    setTitle: (nextTitle) => { document.title = nextTitle },
    print: () => window.print(),
  })
}
