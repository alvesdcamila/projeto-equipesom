import type { CompanyProfile, ProposalIssuerSnapshot } from '../types/domain'

// Dados da empresa-piloto. Permanecem separados de regras globais do produto.
export const pilotCompany: CompanyProfile = {
  tenantId: 'tenant-equipesom-demo',
  brandName: 'EQUIPESOM',
  legalName: '17.681.110 EDEVALDO ALVES',
  document: {
    type: 'CNPJ',
    number: '17.681.110/0001-69',
  },
  address: {
    street: 'SRV MANOEL DAVID DA COSTA',
    number: '38',
    district: 'TAPERA',
    city: 'FLORIANÓPOLIS',
    state: 'SC',
    postalCode: '88.049-525',
  },
  phone: '',
  email: '',
  pillars: ['Qualidade', 'Comprometimento', 'Parceria'],
}

export function createIssuerSnapshot(company: CompanyProfile): ProposalIssuerSnapshot {
  return {
    tenantId: company.tenantId,
    brandName: company.brandName,
    legalName: company.legalName,
    document: { ...company.document },
    address: { ...company.address },
    phone: company.phone?.trim() || undefined,
    email: company.email?.trim() || undefined,
  }
}
