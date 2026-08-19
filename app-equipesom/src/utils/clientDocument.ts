import type { ClientType } from '../types/domain'

const onlyDigits = (value: string) => value.replace(/\D/g, '')

export const getClientDocumentLabel = (clientType: ClientType) =>
  clientType === 'pessoa' ? 'CPF' : 'CNPJ'

export function maskClientDocument(value: string, clientType: ClientType) {
  const limit = clientType === 'pessoa' ? 11 : 14
  const digits = onlyDigits(value).slice(0, limit)

  if (clientType === 'pessoa') {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const hasRepeatedDigits = (digits: string) => /^(\d)\1+$/.test(digits)

function isValidCpf(digits: string) {
  if (digits.length !== 11 || hasRepeatedDigits(digits)) return false
  const calculate = (length: number) => {
    const sum = digits.slice(0, length).split('').reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    )
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }
  return calculate(9) === Number(digits[9]) && calculate(10) === Number(digits[10])
}

function isValidCnpj(digits: string) {
  if (digits.length !== 14 || hasRepeatedDigits(digits)) return false
  const calculate = (base: string, weights: number[]) => {
    const sum = base.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  const first = calculate(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = calculate(digits.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return first === Number(digits[12]) && second === Number(digits[13])
}

export function isValidClientDocument(value: string, clientType: ClientType) {
  const digits = onlyDigits(value)
  return clientType === 'pessoa' ? isValidCpf(digits) : isValidCnpj(digits)
}
