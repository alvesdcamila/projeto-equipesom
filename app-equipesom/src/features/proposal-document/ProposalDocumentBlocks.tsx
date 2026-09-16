import type {
  ProposalDocumentData,
  ProposalDocumentEquipment,
  ProposalDocumentIssuedIdentification,
  ProposalDocumentPlaceDate,
  ProposalDocumentService,
} from './types'
import { formatIssuerAddress, getVisibleIssuerContacts } from '../../utils/issuerPresentation'
import { formatCityState } from '../../utils/eventLocation'

function DocumentField({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null
  return <div className="proposal-document__field"><dt>{label}</dt><dd>{value}</dd></div>
}

export function DocumentTitle({ data }: { data: ProposalDocumentData }) {
  return (
    <header className="proposal-document__title">
      <span>Proposta comercial</span>
      <h1>{data.event.name}</h1>
      <p>{data.event.type}</p>
    </header>
  )
}

export function DocumentContinuationHeader({
  issuerBrandName,
  documentIdentification,
}: {
  issuerBrandName: string
  documentIdentification?: string
}) {
  return (
    <header className="proposal-document__continuation-header">
      <strong>{issuerBrandName}</strong>
      <span>
        Proposta comercial — continuação
        {documentIdentification ? ` · ${documentIdentification}` : ''}
      </span>
    </header>
  )
}

export function DocumentSectionHeading({ children }: { children: string }) {
  return <h2 className="proposal-document__flow-heading">{children}</h2>
}

export function DocumentIssuerBlock({ issuer }: Pick<ProposalDocumentData, 'issuer'>) {
  const contacts = getVisibleIssuerContacts(issuer)

  return (
    <section className="proposal-document__issuer" aria-label="Emissor">
      <div>
        <span className="proposal-document__overline">Emissor</span>
        <strong className="proposal-document__brand">{issuer.brandName}</strong>
      </div>
      <div className="proposal-document__issuer-details">
        <strong>{issuer.legalName}</strong>
        <span>{issuer.document.type}: {issuer.document.number}</span>
        <span>{formatIssuerAddress(issuer)}</span>
        {contacts.map((contact) => <span key={contact}>{contact}</span>)}
      </div>
    </section>
  )
}

export function DocumentPartiesAndEvent({ data }: { data: ProposalDocumentData }) {
  return (
    <div className="proposal-document__information-grid">
      <section className="proposal-document__panel">
        <span className="proposal-document__overline">Contratante</span>
        <h2>{data.client.name}</h2>
        <dl className="proposal-document__fields">
          <DocumentField label={data.client.documentLabel} value={data.client.document} />
          <DocumentField label="Contato" value={data.client.contactName} />
          <DocumentField label="Telefone" value={data.client.phone} />
        </dl>
      </section>

      <section className="proposal-document__panel proposal-document__panel--event">
        <span className="proposal-document__overline">Evento</span>
        <h2>{data.event.name}</h2>
        <dl className="proposal-document__fields">
          <DocumentField label="Tipo" value={data.event.type} />
          <DocumentField label="Data" value={data.event.dateRange} />
          <DocumentField label="Local" value={`${data.event.location} · ${formatCityState(data.event.city, data.event.state)}`} />
          <DocumentField label="Público estimado" value={data.event.estimatedAudience} />
        </dl>
      </section>
    </div>
  )
}

interface DocumentPageFooterProps {
  issuerBrandName: string
  issuedIdentification?: ProposalDocumentIssuedIdentification
  page: number
  totalPages: number
}

export function DocumentPageFooter({
  issuerBrandName,
  issuedIdentification,
  page,
  totalPages,
}: DocumentPageFooterProps) {
  const identification = issuedIdentification
    ? `${issuerBrandName} · ${issuedIdentification.proposalNumber} · ${issuedIdentification.versionLabel}`
    : `${issuerBrandName} · Proposta comercial`

  return (
    <footer className="proposal-document__footer">
      <span>{identification}</span>
      <span>Página {page} de {totalPages}</span>
    </footer>
  )
}

export function DocumentEquipmentRow({ equipment }: { equipment: ProposalDocumentEquipment[] }) {
  return (
    <div className="proposal-document__item-row">
      {equipment.map((item) => (
        <article key={item.key}>
          <strong className="proposal-document__quantity">{item.quantity}×</strong>
          <div>
            <span>{item.category}</span>
            <h3>{item.name}</h3>
            {item.description && <p>{item.description}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}

export function DocumentServiceRow({ services }: { services: ProposalDocumentService[] }) {
  return (
    <div className="proposal-document__service-row">
      {services.map((service) => (
        <article key={service.key}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
        </article>
      ))}
    </div>
  )
}

export function DocumentCommercialSummary({ data }: { data: ProposalDocumentData }) {
  const additionalConditions = [
    data.conditions.mealsProvidedByClient ? 'Alimentação fornecida pelo contratante' : '',
    data.conditions.accommodationRequired ? 'Hospedagem necessária' : '',
  ].filter(Boolean)

  return (
    <div className="proposal-document__commercial-grid">
      <section className="proposal-document__investment">
        <span className="proposal-document__overline">Investimento</span>
        <dl>
          <div><dt>Equipamentos e serviços</dt><dd>{data.values.baseValue}</dd></div>
          <div><dt>Deslocamento</dt><dd>{data.values.travelFee}</dd></div>
          <div><dt>Subtotal</dt><dd>{data.values.subtotalBeforeDiscount}</dd></div>
          <div><dt>{data.values.discountLabel}</dt><dd>− {data.values.discountAmount}</dd></div>
          <div className="proposal-document__total"><dt>Total</dt><dd>{data.values.total}</dd></div>
        </dl>
      </section>

      <section className="proposal-document__conditions">
        <span className="proposal-document__overline">Condições</span>
        <dl className="proposal-document__fields">
          <DocumentField label="Validade" value={data.conditions.validity} />
          <DocumentField label="Pagamento" value={data.conditions.paymentTerm} />
        </dl>
        {additionalConditions.length > 0 && (
          <ul>{additionalConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
        )}
        {data.conditions.commercialNotes.trim() && (
          <div className="proposal-document__notes">
            <strong>Observações</strong>
            <p>{data.conditions.commercialNotes}</p>
          </div>
        )}
        <div className="proposal-document__prepared-by">
          <span>Proposta elaborada por</span>
          <strong>{data.preparedByName}</strong>
        </div>
      </section>
    </div>
  )
}

export function DocumentPlaceDate({ placeDate }: { placeDate: ProposalDocumentPlaceDate }) {
  return (
    <section className="proposal-document__place-date" data-date-context={placeDate.context}>
      <span>{placeDate.label}</span>
      <strong>{placeDate.value}</strong>
    </section>
  )
}
