export const BRAZILIAN_PILOT_PHONE_MAX_DIGITS = 11
export const BRAZILIAN_PILOT_PHONE_MAX_LENGTH = 15

const getDigits = (value: string): string => value.replace(/\D/g, '')

// Regra temporária do piloto brasileiro; não deve limitar futuros tenants internacionais.
export function maskBrazilianPilotPhone(value: string): string {
  if (/^\s*\+55/.test(value)) return ''

  const digits = getDigits(value).slice(0, BRAZILIAN_PILOT_PHONE_MAX_DIGITS)
  if (digits.length <= 2) return digits

  const areaCode = digits.slice(0, 2)
  const localNumber = digits.slice(2)
  if (digits.length === 11) {
    return `(${areaCode}) ${localNumber.slice(0, 5)}-${localNumber.slice(5)}`
  }
  if (localNumber.length <= 4) return `(${areaCode}) ${localNumber}`
  return `(${areaCode}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`
}

export function isValidBrazilianPilotPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || /^\+55/.test(trimmed) || !/^[\d\s().-]+$/.test(trimmed)) return false
  const digits = getDigits(trimmed)
  return digits.length === 10 || digits.length === 11
}
