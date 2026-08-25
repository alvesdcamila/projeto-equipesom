import {
  DocumentCommercialSummary,
  DocumentEquipmentRow,
  DocumentIssuerBlock,
  DocumentPartiesAndEvent,
  DocumentPlaceDate,
  DocumentSectionHeading,
  DocumentServiceRow,
  DocumentTitle,
} from './ProposalDocumentBlocks'
import type { ProposalDocumentPaginationBlock } from './proposalDocumentPaginationBlocks'
import type { ProposalDocumentData, ProposalDocumentPlaceDate } from './types'

interface ProposalDocumentPaginationBlockProps {
  block: ProposalDocumentPaginationBlock
  data: ProposalDocumentData
  placeDate: ProposalDocumentPlaceDate
}

export function ProposalDocumentPaginationBlockView({
  block,
  data,
  placeDate,
}: ProposalDocumentPaginationBlockProps) {
  switch (block.kind) {
    case 'title':
      return <DocumentTitle data={data} />
    case 'issuer':
      return <DocumentIssuerBlock issuer={data.issuer} />
    case 'parties-event':
      return <DocumentPartiesAndEvent data={data} />
    case 'equipment-heading':
      return <DocumentSectionHeading>Equipamentos</DocumentSectionHeading>
    case 'equipment-row':
      return <DocumentEquipmentRow equipment={block.equipment} />
    case 'services-heading':
      return <DocumentSectionHeading>Serviços</DocumentSectionHeading>
    case 'service-row':
      return <DocumentServiceRow services={block.services} />
    case 'commercial-summary':
      return <DocumentCommercialSummary data={data} />
    case 'place-date':
      return <DocumentPlaceDate placeDate={placeDate} />
  }
}
