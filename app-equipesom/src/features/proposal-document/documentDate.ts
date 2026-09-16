import type { ProposalIssuerSnapshot } from '../../types/domain'
import type { ProposalDocumentDateContext, ProposalDocumentPlaceDate } from './types'

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo'

export interface ProposalPreviewSession {
  openedAt: Date
}

export function createProposalPreviewSession(
  clock: () => Date = () => new Date(),
): ProposalPreviewSession {
  const openedAt = clock()
  return { openedAt: new Date(openedAt.getTime()) }
}

function formatCity(city: string): string {
  return city
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .map((word) => word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1))
    .join(' ')
}

function formatBrazilianLongDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: BRAZIL_TIME_ZONE,
  }).format(date)
}

export function createProposalDocumentPlaceDate(
  issuer: ProposalIssuerSnapshot,
  dateContext: ProposalDocumentDateContext,
): ProposalDocumentPlaceDate {
  const location = `${formatCity(issuer.address.city)}/${issuer.address.state.toLocaleUpperCase('pt-BR')}`
  const date = dateContext.kind === 'preview'
    ? dateContext.viewedAt
    : new Date(dateContext.issuedAt)

  return {
    context: dateContext.kind === 'preview' ? 'documentPreview' : 'emittedDocument',
    label: dateContext.kind === 'preview' ? 'Local e data do documento' : 'Local e data de emissão',
    value: `${location}, ${formatBrazilianLongDate(date)}`,
  }
}
