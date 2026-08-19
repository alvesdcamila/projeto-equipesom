import { FieldError } from '../../../components/forms/FieldError'
import type { ProposalStepProps } from '../types'

export function ConditionsStep({ draft, onChange, errors }: ProposalStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <span className="eyebrow">Combine com clareza</span>
        <h2>Condições da proposta</h2>
        <p>Estas condições são configuráveis. Textos definitivos ainda dependem das validações necessárias.</p>
      </div>

      <div className="form-grid form-grid--two">
        <label className={`form-field ${errors.validityDays ? 'is-invalid' : ''}`} htmlFor="validityDays">
          <span>Validade da proposta <em>obrigatório</em></span>
          <div className={`suffix-input ${errors.validityDays ? 'is-invalid' : ''}`}>
            <input
              id="validityDays"
              type="number"
              min="1"
              inputMode="numeric"
              value={draft.validityDays}
              onChange={(event) => onChange('validityDays', Number(event.target.value))}
              aria-invalid={Boolean(errors.validityDays)}
              aria-describedby={errors.validityDays ? 'validityDays-error' : undefined}
            />
            <span>dias</span>
          </div>
          <FieldError id="validityDays-error" message={errors.validityDays} />
        </label>
        <label className={`form-field ${errors.paymentTerm ? 'is-invalid' : ''}`} htmlFor="paymentTerm">
          <span>Condição de pagamento <em>obrigatório</em></span>
          <select id="paymentTerm" value={draft.paymentTerm} onChange={(event) => onChange('paymentTerm', event.target.value)} aria-invalid={Boolean(errors.paymentTerm)} aria-describedby={errors.paymentTerm ? 'paymentTerm-error' : undefined}>
            <option value="">Selecione uma condição</option>
            <option>Até 5 dias úteis após o evento</option>
            <option>Na data do evento</option>
            <option>A combinar</option>
          </select>
          <FieldError id="paymentTerm-error" message={errors.paymentTerm} />
        </label>
      </div>

      <div className="toggle-list">
        <label className="toggle-row">
          <span><strong>Alimentação fornecida pelo cliente</strong><small>Condição comum, mas ajustável por evento.</small></span>
          <input
            type="checkbox"
            role="switch"
            checked={draft.mealsProvidedByClient}
            onChange={(event) => onChange('mealsProvidedByClient', event.target.checked)}
          />
        </label>
        <label className="toggle-row">
          <span><strong>Hospedagem necessária</strong><small>Marque quando o deslocamento exigir pernoite.</small></span>
          <input
            type="checkbox"
            role="switch"
            checked={draft.accommodationRequired}
            onChange={(event) => onChange('accommodationRequired', event.target.checked)}
          />
        </label>
      </div>

      <label className="form-field">
        <span>Observações comerciais</span>
        <textarea
          rows={4}
          value={draft.commercialNotes}
          onChange={(event) => onChange('commercialNotes', event.target.value)}
          placeholder="Inclua combinações específicas deste evento."
        />
      </label>

      <p className="legal-note">Condições de cancelamento, clima, tributos e textos jurídicos permanecem pendentes de definição especializada.</p>
    </div>
  )
}
