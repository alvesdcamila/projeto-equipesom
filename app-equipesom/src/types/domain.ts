export type ProposalStatus = 'rascunho' | 'enviada' | 'aceita'
export type ClientType = 'empresa' | 'pessoa' | 'orgao-publico'

export interface PostalAddress {
  street: string
  number: string
  district: string
  city: string
  state: string
  postalCode: string
}

export interface CompanyDocument {
  type: 'CNPJ' | 'CPF'
  number: string
}

export interface CompanyProfile {
  tenantId: string
  brandName: string
  legalName: string
  document: CompanyDocument
  address: PostalAddress
  phone?: string
  email?: string
  pillars: string[]
}

export interface ProposalIssuerSnapshot {
  tenantId: string
  brandName: string
  legalName: string
  document: CompanyDocument
  address: PostalAddress
  phone?: string
  email?: string
}

export interface InventoryEquipment {
  id: string
  category: string
  normalizedName: string
  reportedQuantity: number
  inventoryUnit: string
  informedBrandModel: string
  informedSpecification: string
  dataState: string
  confirmationNeeded: string
}

export interface ServiceCatalogItem {
  id: string
  name: string
  description: string
}

export interface EquipmentSelection {
  catalogItemId: string
  quantity: number
}

export interface Proposal {
  id: string
  tenantId: string
  clientId: string
  currentVersionId: string
  status: ProposalStatus
  createdAt: string
  updatedAt: string
}

export interface ProposalEquipmentSnapshot {
  catalogItemId: string
  quantity: number
  category: string
  normalizedName: string
  informedBrandModel: string
  informedSpecification: string
  dataState: string
}

export interface ProposalServiceSnapshot {
  serviceId: string
  name: string
  description: string
}

export interface ProposalSnapshot {
  issuer?: ProposalIssuerSnapshot
  client: {
    name: string
    type: ClientType
    document: string
    contactName: string
    phone: string
  }
  event: {
    name: string
    type: string
    startDate: string
    endDate: string
    location: string
    city: string
    estimatedAudience: string
  }
  scope: {
    equipment: ProposalEquipmentSnapshot[]
    services: ProposalServiceSnapshot[]
  }
  values: {
    baseValue: number
    travelFee: number
    discount: number
    total: number
    currency: 'BRL'
    provisional: true
  }
  conditions: {
    validityDays: number
    paymentTerm: string
    mealsProvidedByClient: boolean
    accommodationRequired: boolean
    commercialNotes: string
  }
  preparedBy: {
    name: string
  }
}

export interface ProposalVersion {
  id: string
  proposalId: string
  versionNumber: number
  clientName: string
  eventName: string
  eventDate: string
  total: number
  issuedAt?: string
  snapshot?: ProposalSnapshot
}

export interface ProposalListItem extends Proposal {
  version: ProposalVersion
  source: 'demonstrativo' | 'local'
}

export interface ProposalDraft {
  clientName: string
  clientType: ClientType
  clientDocument: string
  contactName: string
  phone: string
  preparedByName: string
  eventName: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  city: string
  estimatedAudience: string
  equipmentItems: EquipmentSelection[]
  serviceIds: string[]
  baseValue: number
  travelFee: number
  discount: number
  validityDays: number
  paymentTerm: string
  mealsProvidedByClient: boolean
  accommodationRequired: boolean
  commercialNotes: string
}

export interface CommercialDefaults {
  proposalValidityDays: number
  paymentTermLabel: string
  currency: 'BRL'
}

export interface ActiveProposalDraft {
  draft: ProposalDraft
  currentStep: number
  savedAt: string
  editingProposalId: string | null
}
