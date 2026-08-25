import type { ProposalIssuerSnapshot } from '../../types/domain'

export type ProposalDocumentThemeId =
  | 'tecnico-litoraneo'
  | 'verao-profissional'

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
  label: 'Local e data da prévia' | 'Local e data de emissão'
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
  presentationContext: 'documentPreview'
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
    estimatedAudience: string
  }
  equipment: ProposalDocumentEquipment[]
  services: ProposalDocumentService[]
  values: {
    baseValue: string
    travelFee: string
    discount: string
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
