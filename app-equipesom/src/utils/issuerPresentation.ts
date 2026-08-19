import type { ProposalIssuerSnapshot } from '../types/domain'

export function formatIssuerAddress(issuer: ProposalIssuerSnapshot): string {
  const { address } = issuer
  return `${address.street}, ${address.number} · ${address.district} · ${address.city}/${address.state} · CEP ${address.postalCode}`
}

export function getVisibleIssuerContacts(issuer: ProposalIssuerSnapshot): string[] {
  return [issuer.phone?.trim(), issuer.email?.trim()].filter((value): value is string => Boolean(value))
}
