import type { CommercialDefaults } from '../types/domain'

// Padrões configuráveis por empresa e por proposta; não são regras globais.
export const commercialDefaults: CommercialDefaults = {
  proposalValidityDays: 30,
  paymentTermLabel: 'Até 5 dias úteis após o evento',
  currency: 'BRL',
}
