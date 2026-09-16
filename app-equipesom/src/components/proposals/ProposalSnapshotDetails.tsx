import {
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  PackageCheck,
  UserCheck,
  UserRound,
} from 'lucide-react'
import type { ProposalSnapshot } from '../../types/domain'
import { proposalPresentation, type ProposalPresentationContext } from '../../config/proposalPresentation'
import { getClientDocumentLabel } from '../../utils/clientDocument'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { formatCityState } from '../../utils/eventLocation'
import { createPublicEquipmentDescription } from '../../utils/equipmentPresentation'
import { DetailSection } from './DetailSection'
import { IssuerHeader } from './IssuerHeader'

interface ProposalSnapshotDetailsProps {
  snapshot: ProposalSnapshot
  presentationContext?: ProposalPresentationContext
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return <div className="detail-value"><span>{label}</span><strong>{value || 'Não informado'}</strong></div>
}

export function ProposalSnapshotDetails({
  snapshot,
  presentationContext = 'internalDraft',
}: ProposalSnapshotDetailsProps) {
  const presentation = proposalPresentation[presentationContext]
  const values = snapshot.values
  const subtotal = values.pricingModel === 'percentage'
    ? values.subtotalBeforeDiscount
    : values.baseValue + values.travelFee
  const discountAmount = values.pricingModel === 'percentage' ? values.discountAmount : values.discount

  return (
    <div className="proposal-detail__sections">
      <IssuerHeader issuer={snapshot.issuer} />

      <DetailSection eyebrow="Contratante" title="Cliente" icon={<UserRound size={20} />}>
        <div className="detail-grid">
          <DetailValue label="Nome ou razão social" value={snapshot.client.name} />
          <DetailValue label={getClientDocumentLabel(snapshot.client.type)} value={snapshot.client.document} />
          <DetailValue label="Pessoa de contato" value={snapshot.client.contactName} />
          <DetailValue label="Telefone" value={snapshot.client.phone} />
        </div>
      </DetailSection>

      <DetailSection eyebrow="Registro interno" title="Elaboração" icon={<UserCheck size={20} />}>
        <div className="detail-grid">
          <DetailValue label="Proposta elaborada por" value={snapshot.preparedBy.name} />
        </div>
        <p className="detail-disclaimer">Este registro não representa assinatura, emissão ou aceite.</p>
      </DetailSection>

      <DetailSection eyebrow="Programação" title="Evento" icon={<CalendarDays size={20} />}>
        <div className="detail-grid">
          <DetailValue label="Evento" value={snapshot.event.name} />
          <DetailValue label="Tipo" value={snapshot.event.type} />
          <DetailValue label="Data inicial" value={formatDate(snapshot.event.startDate)} />
          <DetailValue label="Data final" value={formatDate(snapshot.event.endDate)} />
          <DetailValue label="Local" value={snapshot.event.location} />
          <DetailValue label="Cidade/UF" value={formatCityState(snapshot.event.city, snapshot.event.state)} />
          <DetailValue label="Público estimado" value={snapshot.event.estimatedAudience} />
        </div>
      </DetailSection>

      <DetailSection eyebrow="Escopo" title="Equipamentos" icon={<PackageCheck size={20} />}>
        {snapshot.scope.equipment.length > 0 ? (
          <div className="detail-item-list">
            {snapshot.scope.equipment.map((item) => (
              <article key={`${item.catalogItemId}-${item.quantity}`}>
                <span className="detail-item-list__quantity">{item.quantity}×</span>
                <div>
                  <span className="detail-item-list__topline">
                    {presentationContext === 'internalDraft' ? `${item.catalogItemId} · ${item.category}` : item.category}
                  </span>
                  <strong>{item.normalizedName}</strong>
                  {presentationContext === 'internalDraft'
                    ? (
                      <>
                        <p>{item.informedBrandModel} · {item.informedSpecification}</p>
                        <small>Estado do dado: {item.dataState}</small>
                      </>
                    )
                    : createPublicEquipmentDescription(item) && <p>{createPublicEquipmentDescription(item)}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : <p className="detail-empty">Nenhum equipamento registrado.</p>}
      </DetailSection>

      <DetailSection eyebrow="Escopo" title="Serviços" icon={<ClipboardList size={20} />}>
        {snapshot.scope.services.length > 0 ? (
          <div className="detail-item-list detail-item-list--services">
            {snapshot.scope.services.map((service) => (
              <article key={service.serviceId}>
                <div><strong>{service.name}</strong><p>{service.description}</p></div>
              </article>
            ))}
          </div>
        ) : <p className="detail-empty">Nenhum serviço registrado.</p>}
      </DetailSection>

      <DetailSection eyebrow={presentation.identification ?? ''} title={presentation.valuesTitle} icon={<CircleDollarSign size={20} />}>
        <div className="detail-grid detail-grid--values">
          <DetailValue label="Equipamentos e serviços" value={formatCurrency(snapshot.values.baseValue)} />
          <DetailValue label="Deslocamento" value={formatCurrency(snapshot.values.travelFee)} />
          <DetailValue label="Subtotal" value={formatCurrency(subtotal)} />
          <DetailValue
            label={values.pricingModel === 'percentage' ? `Desconto (${values.discountPercentage}%)` : 'Desconto fixo registrado'}
            value={formatCurrency(discountAmount)}
          />
          <DetailValue label="Total" value={formatCurrency(snapshot.values.total)} />
        </div>
        {presentation.notice && (
          <p className="detail-disclaimer detail-disclaimer--provisional">{presentation.notice}</p>
        )}
      </DetailSection>

      <DetailSection eyebrow="Combinações" title="Condições e observações" icon={<FileText size={20} />}>
        <div className="detail-grid">
          <DetailValue label="Validade" value={`${snapshot.conditions.validityDays} dias`} />
          <DetailValue label="Pagamento" value={snapshot.conditions.paymentTerm} />
          <DetailValue label="Alimentação pelo cliente" value={snapshot.conditions.mealsProvidedByClient ? 'Sim' : 'Não'} />
          <DetailValue label="Hospedagem necessária" value={snapshot.conditions.accommodationRequired ? 'Sim' : 'Não'} />
        </div>
        <div className="detail-notes">
          <span>Observações</span>
          <p>{snapshot.conditions.commercialNotes || 'Nenhuma observação registrada.'}</p>
        </div>
      </DetailSection>
    </div>
  )
}
