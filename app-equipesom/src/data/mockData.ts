import { commercialDefaults } from '../config/commercialDefaults'
import type { ProposalDraft, ProposalListItem } from '../types/domain'

/**
 * DADOS PROVISÓRIOS DE DEMONSTRAÇÃO
 * Não representam disponibilidade real, preços aprovados ou compromissos comerciais.
 * As versões abaixo são antigas e possuem somente os dados resumidos disponíveis.
 */
export const mockProposals: ProposalListItem[] = [
  {
    id: 'prop-1042',
    tenantId: 'tenant-equipesom-demo',
    clientId: 'cliente-onda',
    currentVersionId: 'prop-1042-v2',
    status: 'enviada',
    createdAt: '2026-08-14',
    updatedAt: '2026-08-15T15:20:00-03:00',
    auditEvents: [],
    source: 'demonstrativo',
    version: {
      id: 'prop-1042-v2',
      proposalId: 'prop-1042',
      versionNumber: 2,
      clientName: 'Instituto Onda Limpa',
      eventName: 'Circuito de Surf da Ilha',
      eventDate: '2026-08-30',
      total: 4200,
      issuedAt: '2026-08-15',
    },
  },
  {
    id: 'prop-1041',
    tenantId: 'tenant-equipesom-demo',
    clientId: 'cliente-aurora',
    currentVersionId: 'prop-1041-v1',
    status: 'rascunho',
    createdAt: '2026-08-12',
    updatedAt: '2026-08-16T10:35:00-03:00',
    auditEvents: [],
    source: 'demonstrativo',
    version: {
      id: 'prop-1041-v1',
      proposalId: 'prop-1041',
      versionNumber: 1,
      clientName: 'Aurora Produções',
      eventName: 'Encontro de Verão',
      eventDate: '2026-09-06',
      total: 2800,
    },
  },
  {
    id: 'prop-1039',
    tenantId: 'tenant-equipesom-demo',
    clientId: 'cliente-laguna',
    currentVersionId: 'prop-1039-v1',
    status: 'aceita',
    createdAt: '2026-08-08',
    updatedAt: '2026-08-10T09:10:00-03:00',
    auditEvents: [],
    source: 'demonstrativo',
    version: {
      id: 'prop-1039-v1',
      proposalId: 'prop-1039',
      versionNumber: 1,
      clientName: 'Associação Laguna',
      eventName: 'Festival na Praia',
      eventDate: '2026-08-23',
      total: 3500,
      issuedAt: '2026-08-09',
    },
  },
]

export const initialProposalDraft: ProposalDraft = {
  clientName: '',
  clientType: 'empresa',
  clientDocument: '',
  contactName: '',
  phone: '',
  preparedByName: '',
  eventName: '',
  eventType: 'Campeonato de surf',
  startDate: '',
  endDate: '',
  location: '',
  city: 'FLORIANÓPOLIS',
  eventState: 'SC',
  estimatedAudience: '',
  equipmentItems: [],
  serviceIds: ['operacao', 'montagem'],
  baseValue: 1400,
  travelFee: 0,
  discountPercentage: 0,
  validityDays: commercialDefaults.proposalValidityDays,
  paymentTerm: commercialDefaults.paymentTermLabel,
  mealsProvidedByClient: true,
  accommodationRequired: false,
  commercialNotes: '',
}

export function createInitialProposalDraft(): ProposalDraft {
  return {
    ...initialProposalDraft,
    equipmentItems: initialProposalDraft.equipmentItems.map((item) => ({ ...item })),
    serviceIds: [...initialProposalDraft.serviceIds],
  }
}
