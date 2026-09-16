import type { ProposalDraft } from '../types/domain'

export type TextValueKind =
  | 'free-text'
  | 'email'
  | 'password'
  | 'url'
  | 'technical-identifier'
  | 'internal-code'
  | 'numeric'
  | 'date'

export const pilotUppercaseDraftFields = [
  'clientName',
  'contactName',
  'preparedByName',
  'eventName',
  'location',
  'city',
  'commercialNotes',
] as const satisfies readonly (keyof ProposalDraft)[]

const pilotUppercaseDraftFieldSet = new Set<keyof ProposalDraft>(pilotUppercaseDraftFields)

/**
 * Política específica da experiência atual da EQUIPESOM.
 * Outros tenants poderão configurar outra apresentação no futuro.
 */
export function normalizeTextValue(value: string, kind: TextValueKind, trim = false): string {
  const prepared = trim ? value.trim() : value
  return kind === 'free-text' ? prepared.toLocaleUpperCase('pt-BR') : prepared
}

export function normalizePilotDraftField<K extends keyof ProposalDraft>(
  field: K,
  value: ProposalDraft[K],
): ProposalDraft[K] {
  if (typeof value !== 'string' || !pilotUppercaseDraftFieldSet.has(field)) return value
  return normalizeTextValue(value, 'free-text') as ProposalDraft[K]
}

export function normalizePilotDraftFreeTexts(draft: ProposalDraft): ProposalDraft {
  const normalized = { ...draft }
  for (const field of pilotUppercaseDraftFields) {
    normalized[field] = normalizeTextValue(draft[field] as string, 'free-text', true) as never
  }
  return normalized
}
