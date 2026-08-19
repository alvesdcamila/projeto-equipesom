import type { ServiceCatalogItem } from '../types/domain'

export const serviceCatalog: ServiceCatalogItem[] = [
  { id: 'operacao', name: 'Operação técnica', description: 'Acompanhamento técnico durante o período contratado.' },
  { id: 'montagem', name: 'Montagem e desmontagem', description: 'Preparação, testes e retirada da estrutura.' },
  { id: 'passagem-som', name: 'Passagem de som', description: 'Ajustes prévios com atrações e organização.' },
]

export function getServiceById(id: string) {
  return serviceCatalog.find((service) => service.id === id)
}
