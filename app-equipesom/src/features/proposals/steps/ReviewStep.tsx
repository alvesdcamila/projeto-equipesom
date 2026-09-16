import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  PackageCheck,
  Pencil,
  UserCheck,
  UserRound,
} from 'lucide-react'
import { getEquipmentById } from '../../../data/inventoryEquipment'
import { getServiceById } from '../../../data/services'
import { createIssuerSnapshot, pilotCompany } from '../../../config/company'
import { IssuerHeader } from '../../../components/proposals/IssuerHeader'
import type { ProposalDraft } from '../../../types/domain'
import { getClientDocumentLabel } from '../../../utils/clientDocument'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { formatCityState } from '../../../utils/eventLocation'
import { calculateDraftAmounts } from '../../../utils/proposalAmounts'
import type { ValidationIssueGroup } from '../validation'

interface ReviewStepProps {
  draft: ProposalDraft
  onEdit: (step: number) => void
  issues: ValidationIssueGroup[]
  isEditing?: boolean
}

export function ReviewStep({ draft, onEdit, issues, isEditing = false }: ReviewStepProps) {
  const equipment = draft.equipmentItems.map((selection) => ({
    selection,
    item: getEquipmentById(selection.catalogItemId),
  }))
  const services = draft.serviceIds.map((serviceId) => getServiceById(serviceId)).filter(Boolean)
  const amounts = calculateDraftAmounts(draft)
  const documentLabel = getClientDocumentLabel(draft.clientType)

  const sections = [
    {
      title: 'Contratante',
      icon: UserRound,
      step: 0,
      content: draft.clientName || 'Cliente ainda não informado',
      detail: `${documentLabel}: ${draft.clientDocument || 'não informado'} · ${draft.contactName || 'contato não informado'}`,
    },
    {
      title: 'Elaboração',
      icon: UserCheck,
      step: 0,
      content: draft.preparedByName.trim() || 'Responsável ainda não informado',
      detail: 'Registro de elaboração; não representa assinatura, emissão ou aceite.',
    },
    {
      title: 'Evento',
      icon: CalendarDays,
      step: 1,
      content: draft.eventName || draft.eventType,
      detail: `${formatDate(draft.startDate)} · ${draft.location || 'local não informado'} · ${formatCityState(draft.city, draft.eventState) || 'cidade/UF pendente'}`,
    },
    {
      title: 'Escopo',
      icon: PackageCheck,
      step: 2,
      content: `${equipment.length} ${equipment.length === 1 ? 'equipamento' : 'equipamentos'} e ${services.length} ${services.length === 1 ? 'serviço' : 'serviços'}`,
      detail: equipment.length + services.length > 0 ? 'Confira as quantidades e descrições abaixo.' : 'Nenhum item selecionado',
    },
    {
      title: 'Valor provisório',
      icon: CircleDollarSign,
      step: 3,
      content: formatCurrency(amounts.total),
      detail: amounts.pricingModel === 'legacy-fixed'
        ? `Desconto fixo anterior de ${formatCurrency(amounts.discountAmount)} precisa ser redefinido`
        : amounts.discountAmount > 0
          ? `Desconto de ${amounts.discountPercentage}% (${formatCurrency(amounts.discountAmount)})`
          : 'Sem desconto aplicado',
    },
    {
      title: 'Condições',
      icon: FileText,
      step: 4,
      content: `${draft.validityDays} dias de validade`,
      detail: draft.paymentTerm,
    },
  ]

  return (
    <div className="step-content">
      <div className="step-heading">
        <span className="eyebrow">Confira com calma</span>
        <h2>Revisão do rascunho</h2>
        <p>
          {isEditing
            ? 'Ao salvar, os dados deste rascunho local serão atualizados sem criar outra versão.'
            : 'Ao concluir, o rascunho ficará pronto para a revisão final e a emissão da proposta.'}
        </p>
      </div>

      {issues.length > 0 ? (
        <section className="review-pending" id="review-pending-summary" role="alert" tabIndex={-1}>
          <div className="review-pending__heading">
            <AlertTriangle size={20} />
            <div>
              <strong>{issues.length === 1 ? 'Há uma etapa com pendências' : `Há ${issues.length} etapas com pendências`}</strong>
              <p>Corrija os campos abaixo antes de concluir o rascunho.</p>
            </div>
          </div>
          <ul>
            {issues.map((issue) => (
              <li key={issue.step}>
                <div><strong>{issue.label}</strong><span>{issue.messages.join(' ')}</span></div>
                <button type="button" onClick={() => onEdit(issue.step)}>Corrigir</button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="review-ready" role="status">
          <CheckCircle2 size={19} />
          <span><strong>Nenhuma pendência encontrada.</strong> O rascunho pode ser concluído.</span>
        </div>
      )}

      <IssuerHeader issuer={createIssuerSnapshot(pilotCompany)} compact />

      <div className="review-list">
        {sections.map(({ title, icon: Icon, step, content, detail }) => (
          <section className="review-card" key={title}>
            <div className="review-card__icon"><Icon size={19} /></div>
            <div className="review-card__content">
              <span>{title}</span>
              <strong>{content}</strong>
              <p>{detail}</p>
            </div>
            <button type="button" onClick={() => onEdit(step)} aria-label={`Editar ${title.toLowerCase()}`}>
              <Pencil size={17} />
            </button>
          </section>
        ))}
      </div>

      <section className="review-scope">
        <div className="review-scope__heading">
          <div><span className="eyebrow">Itens escolhidos</span><h3>Equipamentos e serviços</h3></div>
          <button type="button" onClick={() => onEdit(2)}><Pencil size={15} /> Editar</button>
        </div>

        {equipment.length > 0 && (
          <div className="review-scope__group">
            <h4>Equipamentos</h4>
            {equipment.map(({ selection, item }) => (
              <article key={selection.catalogItemId}>
                <span className="item-quantity">{selection.quantity}×</span>
                <div>
                  <strong>{item?.normalizedName ?? selection.catalogItemId}</strong>
                  <p>{item ? `${item.informedBrandModel} · ${item.informedSpecification}` : 'Descrição não registrada'}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {services.length > 0 && (
          <div className="review-scope__group">
            <h4>Serviços</h4>
            {services.map((service) => service && (
              <article key={service.id}>
                <span className="item-quantity item-quantity--service">S</span>
                <div><strong>{service.name}</strong><p>{service.description}</p></div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="version-note">
        <strong>Proposta e versão preservadas separadamente</strong>
        <p>Este rascunho guardará uma fotografia dos dados preenchidos. Futuras alterações em versões emitidas não deverão sobrescrever o histórico.</p>
      </div>
    </div>
  )
}
