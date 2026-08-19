import { Building2, Landmark, UserRound } from 'lucide-react'
import { FieldError } from '../../../components/forms/FieldError'
import { getClientDocumentLabel, maskClientDocument } from '../../../utils/clientDocument'
import { BRAZILIAN_PILOT_PHONE_MAX_LENGTH, maskBrazilianPilotPhone } from '../../../utils/clientPhone'
import type { ProposalStepProps } from '../types'

const clientTypes = [
  { value: 'empresa', label: 'Empresa', icon: Building2 },
  { value: 'pessoa', label: 'Pessoa física', icon: UserRound },
  { value: 'orgao-publico', label: 'Órgão público', icon: Landmark },
] as const

export function ClientStep({ draft, onChange, errors }: ProposalStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <span className="eyebrow">Quem está contratando?</span>
        <h2>Dados do cliente</h2>
        <p>Comece com as informações essenciais. O cadastro completo poderá ser feito depois.</p>
      </div>

      <fieldset className="form-fieldset">
        <legend>Tipo de cliente</legend>
        <div className="choice-grid choice-grid--three">
          {clientTypes.map(({ value, label, icon: Icon }) => (
            <label className={draft.clientType === value ? 'choice-card is-selected' : 'choice-card'} key={value}>
              <input
                type="radio"
                name="clientType"
                value={value}
                checked={draft.clientType === value}
                onChange={() => onChange('clientType', value)}
              />
              <Icon size={21} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-grid form-grid--two">
        <label className={`form-field form-field--full ${errors.clientName ? 'is-invalid' : ''}`} htmlFor="clientName">
          <span>Nome ou razão social <em>obrigatório</em></span>
          <input
            id="clientName"
            type="text"
            value={draft.clientName}
            onChange={(event) => onChange('clientName', event.target.value)}
            placeholder="Ex.: Instituto Onda Limpa"
            autoComplete="organization"
            aria-invalid={Boolean(errors.clientName)}
            aria-describedby={errors.clientName ? 'clientName-error' : undefined}
          />
          <FieldError id="clientName-error" message={errors.clientName} />
        </label>
        <label className={`form-field ${errors.clientDocument ? 'is-invalid' : ''}`} htmlFor="clientDocument">
          <span>{getClientDocumentLabel(draft.clientType)} <em>opcional</em></span>
          <input
            id="clientDocument"
            type="text"
            inputMode="numeric"
            value={draft.clientDocument}
            onChange={(event) => onChange('clientDocument', maskClientDocument(event.target.value, draft.clientType))}
            placeholder={draft.clientType === 'pessoa' ? '000.000.000-00' : '00.000.000/0000-00'}
            autoComplete="off"
            aria-invalid={Boolean(errors.clientDocument)}
            aria-describedby={errors.clientDocument ? 'clientDocument-error' : 'clientDocument-help'}
          />
          <small className="field-help" id="clientDocument-help">Documento do cliente, separado dos dados da EQUIPESOM.</small>
          <FieldError id="clientDocument-error" message={errors.clientDocument} />
        </label>
        <label className="form-field">
          <span>Pessoa de contato</span>
          <input
            type="text"
            value={draft.contactName}
            onChange={(event) => onChange('contactName', event.target.value)}
            placeholder="Nome do contato"
            autoComplete="name"
          />
        </label>
        <label className={`form-field ${errors.phone ? 'is-invalid' : ''}`} htmlFor="phone">
          <span>Telefone</span>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={BRAZILIAN_PILOT_PHONE_MAX_LENGTH}
            value={draft.phone}
            onChange={(event) => onChange('phone', maskBrazilianPilotPhone(event.target.value))}
            placeholder="(48) 99999-9999"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
          />
          <small className="field-help" id="phone-help">Opcional. Use DDD e 10 ou 11 dígitos, sem +55.</small>
          <FieldError id="phone-error" message={errors.phone} />
        </label>
        <label className={`form-field form-field--full ${errors.preparedByName ? 'is-invalid' : ''}`} htmlFor="preparedByName">
          <span>Nome completo de quem elaborou a proposta <em>obrigatório</em></span>
          <input
            id="preparedByName"
            type="text"
            value={draft.preparedByName}
            onChange={(event) => onChange('preparedByName', event.target.value)}
            placeholder="Digite o nome completo"
            autoComplete="name"
            aria-invalid={Boolean(errors.preparedByName)}
            aria-describedby={errors.preparedByName ? 'preparedByName-error' : 'preparedByName-help'}
          />
          <small className="field-help" id="preparedByName-help">Registro de elaboração; não representa assinatura, emissão ou aceite.</small>
          <FieldError id="preparedByName-error" message={errors.preparedByName} />
        </label>
      </div>
    </div>
  )
}
