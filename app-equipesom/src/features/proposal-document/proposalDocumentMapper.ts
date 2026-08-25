import type { ProposalListItem, ProposalSnapshot } from '../../types/domain'
import { pilotCompany } from '../../config/company'
import { getClientDocumentLabel } from '../../utils/clientDocument'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { ProposalDocumentData } from './types'

const unavailableDescriptionValues = new Set([
  '',
  'Não registrado',
  'Detalhes não registrados',
])

function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  return startDate === endDate ? start : `${start} a ${end}`
}

function equipmentDescription(brandModel: string, specification: string): string {
  const parts = [brandModel, specification]
    .map((part) => part.trim())
    .filter((part) => !unavailableDescriptionValues.has(part))
  return parts.join(' · ')
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

export function createProposalDocumentData(snapshot: ProposalSnapshot): ProposalDocumentData | null {
  if (!snapshot.issuer) return null

  return {
    presentationContext: 'documentPreview',
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
      estimatedAudience: snapshot.event.estimatedAudience,
    },
    equipment: snapshot.scope.equipment.map((item) => ({
      key: `${item.catalogItemId}-${item.quantity}`,
      quantity: item.quantity,
      category: item.category,
      name: item.normalizedName,
      description: equipmentDescription(item.informedBrandModel, item.informedSpecification),
    })),
    services: snapshot.scope.services.map((service) => ({
      key: service.serviceId,
      name: service.name,
      description: service.description,
    })),
    values: {
      baseValue: formatCurrency(snapshot.values.baseValue),
      travelFee: formatCurrency(snapshot.values.travelFee),
      discount: formatCurrency(snapshot.values.discount),
      total: formatCurrency(snapshot.values.total),
    },
    conditions: {
      validity: `${snapshot.conditions.validityDays} dias`,
      paymentTerm: snapshot.conditions.paymentTerm,
      mealsProvidedByClient: snapshot.conditions.mealsProvidedByClient,
      accommodationRequired: snapshot.conditions.accommodationRequired,
      commercialNotes: snapshot.conditions.commercialNotes,
    },
    preparedByName: snapshot.preparedBy.name,
  }
}
