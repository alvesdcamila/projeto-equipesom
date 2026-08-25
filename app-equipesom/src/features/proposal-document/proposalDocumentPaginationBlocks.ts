import type {
  ProposalDocumentData,
  ProposalDocumentEquipment,
  ProposalDocumentService,
} from './types'

export type ProposalDocumentPaginationBlock =
  | { id: 'title'; kind: 'title'; keepWithNext: true }
  | { id: 'issuer'; kind: 'issuer'; keepWithNext: true }
  | { id: 'parties-event'; kind: 'parties-event' }
  | { id: 'equipment-heading'; kind: 'equipment-heading'; keepWithNext: true }
  | { id: string; kind: 'equipment-row'; equipment: ProposalDocumentEquipment[] }
  | { id: 'services-heading'; kind: 'services-heading'; keepWithNext: true }
  | { id: string; kind: 'service-row'; services: ProposalDocumentService[] }
  | { id: 'commercial-summary'; kind: 'commercial-summary'; keepWithNext: true }
  | { id: 'place-date'; kind: 'place-date' }

function chunksOfTwo<T>(items: T[]): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += 2) {
    chunks.push(items.slice(index, index + 2))
  }
  return chunks
}

export function createProposalDocumentPaginationBlocks(
  data: ProposalDocumentData,
): ProposalDocumentPaginationBlock[] {
  const equipmentRows: ProposalDocumentPaginationBlock[] = chunksOfTwo(data.equipment)
    .map((equipment, index) => ({
      id: `equipment-row-${index + 1}`,
      kind: 'equipment-row',
      equipment,
    }))
  const serviceRows: ProposalDocumentPaginationBlock[] = chunksOfTwo(data.services)
    .map((services, index) => ({
      id: `service-row-${index + 1}`,
      kind: 'service-row',
      services,
    }))

  return [
    { id: 'title', kind: 'title', keepWithNext: true },
    { id: 'issuer', kind: 'issuer', keepWithNext: true },
    { id: 'parties-event', kind: 'parties-event' },
    { id: 'equipment-heading', kind: 'equipment-heading', keepWithNext: true },
    ...equipmentRows,
    { id: 'services-heading', kind: 'services-heading', keepWithNext: true },
    ...serviceRows,
    { id: 'commercial-summary', kind: 'commercial-summary', keepWithNext: true },
    { id: 'place-date', kind: 'place-date' },
  ]
}
