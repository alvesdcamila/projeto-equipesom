import type { ProposalDraft } from '../../types/domain'
import { isValidClientDocument, getClientDocumentLabel } from '../../utils/clientDocument'
import { isValidBrazilianPilotPhone } from '../../utils/clientPhone'

export type DraftField = keyof ProposalDraft
export type ValidationErrors = Partial<Record<DraftField, string>>

export interface ValidationIssueGroup {
  step: number
  label: string
  messages: string[]
}

export function validateStep(step: number, draft: ProposalDraft): ValidationErrors {
  const errors: ValidationErrors = {}

  if (step === 0) {
    if (!draft.clientName.trim()) errors.clientName = 'Informe o nome ou a razão social.'
    if (draft.clientDocument.trim() && !isValidClientDocument(draft.clientDocument, draft.clientType)) {
      errors.clientDocument = `Informe um ${getClientDocumentLabel(draft.clientType)} válido.`
    }
    if (draft.phone.trim() && !isValidBrazilianPilotPhone(draft.phone)) {
      errors.phone = 'Informe um telefone brasileiro válido, com DDD e 10 ou 11 dígitos, sem +55.'
    }
    if (!draft.preparedByName.trim()) errors.preparedByName = 'Informe o nome completo de quem elaborou a proposta.'
  }

  if (step === 1) {
    if (!draft.eventName.trim()) errors.eventName = 'Informe o nome do evento.'
    if (!draft.startDate) errors.startDate = 'Informe a data inicial.'
    if (!draft.endDate) errors.endDate = 'Informe a data final.'
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      errors.endDate = 'A data final não pode ser anterior à data inicial.'
    }
    if (!draft.location.trim()) errors.location = 'Informe o local do evento.'
    if (!draft.city.trim()) errors.city = 'Informe a cidade.'
  }

  if (step === 2) {
    if (draft.equipmentItems.length === 0 && draft.serviceIds.length === 0) {
      errors.equipmentItems = 'Selecione ao menos um equipamento ou serviço.'
    } else if (draft.equipmentItems.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      errors.equipmentItems = 'Informe uma quantidade maior que zero para cada equipamento.'
    }
  }

  if (step === 3) {
    const subtotal = draft.baseValue + draft.travelFee
    const total = subtotal - draft.discount
    if (total <= 0) errors.baseValue = 'O total da proposta deve ser maior que zero.'
    if (draft.discount > subtotal) {
      errors.discount = 'O desconto não pode ser maior que o valor-base somado ao deslocamento.'
    }
  }

  if (step === 4) {
    if (draft.validityDays <= 0) errors.validityDays = 'A validade deve ser maior que zero.'
    if (!draft.paymentTerm.trim()) errors.paymentTerm = 'Selecione uma condição de pagamento.'
  }

  return errors
}

export function validateAllSteps(draft: ProposalDraft): ValidationErrors {
  return [0, 1, 2, 3, 4].reduce<ValidationErrors>(
    (allErrors, step) => ({ ...allErrors, ...validateStep(step, draft) }),
    {},
  )
}

const stepLabels = ['Cliente', 'Evento', 'Equipamentos e serviços', 'Valores', 'Condições']

export function groupValidationIssues(draft: ProposalDraft): ValidationIssueGroup[] {
  return [0, 1, 2, 3, 4]
    .map((step) => ({
      step,
      label: stepLabels[step],
      messages: Object.values(validateStep(step, draft)),
    }))
    .filter((group) => group.messages.length > 0)
}
