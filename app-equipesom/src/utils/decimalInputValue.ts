export function normalizeEditableDecimal(value: string, decimalPlaces = 2): string {
  const trimmed = value.trim().replace(',', '.')
  const negative = trimmed.startsWith('-')
  const unsigned = trimmed.replace(/-/g, '').replace(/[^\d.]/g, '')
  const [wholePart = '', ...fractionParts] = unsigned.split('.')
  const hasSeparator = unsigned.includes('.')
  const normalizedWhole = (wholePart || (hasSeparator ? '0' : '')).replace(/^0+(?=\d)/, '')
  const fraction = fractionParts.join('').slice(0, decimalPlaces)
  const sign = negative ? '-' : ''
  return `${sign}${normalizedWhole}${hasSeparator ? `.${fraction}` : ''}`
}

export function parseEditableDecimal(value: string): number | null {
  if (!value || value === '-' || value === '.' || value === '-.') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
