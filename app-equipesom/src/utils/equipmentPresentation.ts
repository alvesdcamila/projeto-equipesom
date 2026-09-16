import type { ProposalEquipmentSnapshot } from '../types/domain'

const internalInventoryNote = /\b(?:confirmar|confirmação|não confirmad[oa]s?|não informad[oa]s?|presumid[oa]s?|pouco legível|linha original|configuração genérica|detalhes não registrados|não registrado|informad[oa]s? pelo nome)\b/i

function publicDescriptionPart(value: string): string {
  return value
    .split(/\s+[—–-]\s+/)
    .map((part) => part.trim())
    .filter((part) => part && !internalInventoryNote.test(part))
    .join(' · ')
}

function publicSpecificationPart(value: string): string {
  return internalInventoryNote.test(value) ? '' : publicDescriptionPart(value)
}

/**
 * Mantém observações de reconciliação no inventário interno, mas impede que
 * incertezas e pedidos de confirmação sejam publicados no documento comercial.
 */
export function createPublicEquipmentDescription(
  equipment: Pick<ProposalEquipmentSnapshot, 'informedBrandModel' | 'informedSpecification'>,
): string {
  return [
    publicDescriptionPart(equipment.informedBrandModel),
    publicSpecificationPart(equipment.informedSpecification),
  ]
    .filter(Boolean)
    .join(' · ')
}
