export const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export type BrazilianStateCode = (typeof brazilianStates)[number]

const brazilianStateSet = new Set<string>(brazilianStates)

export function isBrazilianStateCode(value: unknown): value is BrazilianStateCode {
  return typeof value === 'string' && brazilianStateSet.has(value)
}
