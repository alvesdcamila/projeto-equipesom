import type { ProposalListItem, ProposalSnapshot } from '../../types/domain'
import { pilotCompany } from '../../config/company'
import { getClientDocumentLabel } from '../../utils/clientDocument'
import { createPublicEquipmentDescription } from '../../utils/equipmentPresentation'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { ProposalDocumentData } from './types'

function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return startDate === endDate ? start : `${start} a ${end}`
}

export function canPreviewProposal(proposal: ProposalListItem | undefined): boolean {
  return Boolean(
    proposal
      && proposal.tenantId === pilotCompany.tenantId
      && proposal.source === 'local'
      && proposal.status === 'rascunho'
      && proposal.version.snapshot?.issuer
      && proposal.version.snapshot.issuer.tenantId === proposal.tenantId,
  )
}

export function canOpenProposalDocument(proposal: ProposalListItem | undefined): boolean {
  if (!proposal
    || proposal.tenantId !== pilotCompany.tenantId
    || proposal.source !== 'local'
    || !proposal.version.snapshot?.issuer
    || proposal.version.snapshot.issuer.tenantId !== proposal.tenantId) return false

  if (proposal.status === 'rascunho') return true
  return Boolean(
    ['emitida', 'enviada', 'aceita'].includes(proposal.status)
      && proposal.version.issuedAt
      && proposal.version.proposalNumber
      && proposal.version.documentThemeId,
  )
}

interface ProposalDocumentOptions {
  presentationContext?: 'documentPreview' | 'emittedDocument'
  proposalNumber?: string
  versionNumber?: number
  issuedAt?: string
}

function formatValidity(validityDays: number, issuedAt?: string): string {
  if (!issuedAt) return `${validityDays} dias`
  const expiresAt = new Date(issuedAt)
  expiresAt.setDate(expiresAt.getDate() + validityDays)
  const expirationDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(expiresAt)
  return `${validityDays} dias · até ${expirationDate}`
}

export function createProposalDocumentData(
  snapshot: ProposalSnapshot,
  options: ProposalDocumentOptions = {},
): ProposalDocumentData | null {
  if (!snapshot.issuer) return null
  const values = snapshot.values
  const subtotalBeforeDiscount = values.pricingModel === 'percentage'
    ? values.subtotalBeforeDiscount
    : values.baseValue + values.travelFee
  const discountAmount = values.pricingModel === 'percentage' ? values.discountAmount : values.discount

  return {
    presentationContext: options.presentationContext ?? 'documentPreview',
    issuedIdentification: options.proposalNumber && options.versionNumber
      ? { proposalNumber: options.proposalNumber, versionLabel: `v${options.versionNumber}` }
      : undefined,
    issuer: {
      ...snapshot.issuer,
      document: { ...snapshot.issuer.document },
      address: { ...snapshot.issuer.address },
    },
    client: {
      name: snapshot.client.name,
      documentLabel: getClientDocumentLabel(snapshot.client.type),
      document: snapshot.client.document,
      contactName: snapshot.client.contactName,
      phone: snapshot.client.phone,
    },
    event: {
      name: snapshot.event.name,
      type: snapshot.event.type,
      dateRange: formatDateRange(snapshot.event.startDate, snapshot.event.endDate),
      location: snapshot.event.location,
      city: snapshot.event.city,
      state: snapshot.event.state ?? '',
      estimatedAudience: snapshot.event.estimatedAudience,
    },
    equipment: snapshot.scope.equipment.map((item) => ({
      key: `${item.catalogItemId}-${item.quantity}`,
      quantity: item.quantity,
      category: item.category,
      name: item.normalizedName,
      description: createPublicEquipmentDescription(item),
    })),
    services: snapshot.scope.services.map((service) => ({
      key: service.serviceId,
      name: service.name,
      description: service.description,
    })),
    values: {
      baseValue: formatCurrency(snapshot.values.baseValue),
      travelFee: formatCurrency(snapshot.values.travelFee),
      subtotalBeforeDiscount: formatCurrency(subtotalBeforeDiscount),
      discountLabel: values.pricingModel === 'percentage'
        ? `Desconto (${values.discountPercentage}%)`
        : 'Desconto fixo registrado',
      discountAmount: formatCurrency(discountAmount),
      total: formatCurrency(snapshot.values.total),
    },
    conditions: {
      validity: formatValidity(snapshot.conditions.validityDays, options.issuedAt),
      paymentTerm: snapshot.conditions.paymentTerm,
      mealsProvidedByClient: snapshot.conditions.mealsProvidedByClient,
      accommodationRequired: snapshot.conditions.accommodationRequired,
      commercialNotes: snapshot.conditions.commercialNotes,
    },
    preparedByName: snapshot.preparedBy.name,
  }
}
