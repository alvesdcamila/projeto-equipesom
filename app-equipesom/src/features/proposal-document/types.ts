import type { ProposalDocumentThemeId, ProposalIssuerSnapshot } from '../../types/domain'

export type { ProposalDocumentThemeId } from '../../types/domain'

export interface ProposalDocumentTheme {
  id: ProposalDocumentThemeId
  name: string
  description: string
  tokens: {
    ink: string
    accent: string
    soft: string
    paper: string
  }
}

export type ProposalDocumentDateContext =
  | { kind: 'preview'; viewedAt: Date }
  | { kind: 'emitted'; issuedAt: string }

export interface ProposalDocumentPlaceDate {
  context: 'documentPreview' | 'emittedDocument'
  label: 'Local e data do documento' | 'Local e data de emissão'
  value: string
}

export interface ProposalDocumentEquipment {
  key: string
  quantity: number
  category: string
  name: string
  description: string
}

export interface ProposalDocumentService {
  key: string
  name: string
  description: string
}

export interface ProposalDocumentIssuedIdentification {
  proposalNumber: string
  versionLabel: string
}

export interface ProposalDocumentData {
  presentationContext: 'documentPreview' | 'emittedDocument'
  issuedIdentification?: ProposalDocumentIssuedIdentification
  issuer: ProposalIssuerSnapshot
  client: {
    name: string
    documentLabel: 'CNPJ' | 'CPF'
    document: string
    contactName: string
    phone: string
  }
  event: {
    name: string
    type: string
    dateRange: string
    location: string
    city: string
    state: string
    estimatedAudience: string
  }
  equipment: ProposalDocumentEquipment[]
  services: ProposalDocumentService[]
  values: {
    baseValue: string
    travelFee: string
    subtotalBeforeDiscount: string
    discountLabel: string
    discountAmount: string
    total: string
  }
  conditions: {
    validity: string
    paymentTerm: string
    mealsProvidedByClient: boolean
    accommodationRequired: boolean
    commercialNotes: string
  }
  preparedByName: string
}
