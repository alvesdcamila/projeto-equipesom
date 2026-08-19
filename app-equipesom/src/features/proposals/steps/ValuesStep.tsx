import { ShieldCheck } from 'lucide-react'
import { FieldError } from '../../../components/forms/FieldError'
import type { ProposalStepProps } from '../types'
import { formatCurrency } from '../../../utils/formatters'

export function ValuesStep({ draft, onChange, errors }: ProposalStepProps) {
  const total = Math.max(0, draft.baseValue + draft.travelFee - draft.discount)

  return (
    <div className="step-content">
      <div className="step-heading">
        <span className="eyebrow">Composição comercial</span>
        <h2>Valores da proposta</h2>
        <p>Preços são editáveis e pertencem a esta proposta. Nenhum valor é aplicado como regra automática.</p>
      </div>

      <div className="value-layout">
        <div className="form-grid">
          <label className={`form-field ${errors.baseValue ? 'is-invalid' : ''}`} htmlFor="baseValue">
            <span>Valor de equipamentos e serviços <em>provisório</em></span>
            <div className={`money-input ${errors.baseValue ? 'is-invalid' : ''}`}>
              <span>R$</span>
              <input
                id="baseValue"
                type="number"
                min="0"
                step="50"
                inputMode="decimal"
                value={draft.baseValue}
                onChange={(event) => onChange('baseValue', Number(event.target.value))}
                aria-invalid={Boolean(errors.baseValue)}
                aria-describedby={errors.baseValue ? 'baseValue-error' : undefined}
              />
            </div>
            <FieldError id="baseValue-error" message={errors.baseValue} />
          </label>
          <label className="form-field">
            <span>Deslocamento</span>
            <div className="money-input">
              <span>R$</span>
              <input
                type="number"
                min="0"
                step="50"
                inputMode="decimal"
                value={draft.travelFee}
                onChange={(event) => onChange('travelFee', Number(event.target.value))}
              />
            </div>
          </label>
          <label className={`form-field ${errors.discount ? 'is-invalid' : ''}`} htmlFor="discount">
            <span>Desconto autorizado <em>provisório</em></span>
            <div className={`money-input ${errors.discount ? 'is-invalid' : ''}`}>
              <span>R$</span>
              <input
                id="discount"
                type="number"
                min="0"
                step="50"
                inputMode="decimal"
                value={draft.discount}
                onChange={(event) => onChange('discount', Number(event.target.value))}
                aria-invalid={Boolean(errors.discount)}
                aria-describedby={errors.discount ? 'discount-error' : 'discount-help'}
              />
            </div>
            <small className="field-help" id="discount-help"><ShieldCheck size={14} /> No processo atual, descontos dependem de autorização.</small>
            <FieldError id="discount-error" message={errors.discount} />
          </label>
        </div>

        <aside className="total-card">
          <span>Total estimado</span>
          <strong>{formatCurrency(total)}</strong>
          <div className="total-card__line"><span>Serviços e equipamentos</span><b>{formatCurrency(draft.baseValue)}</b></div>
          <div className="total-card__line"><span>Deslocamento</span><b>{formatCurrency(draft.travelFee)}</b></div>
          <div className="total-card__line"><span>Desconto</span><b>− {formatCurrency(draft.discount)}</b></div>
          <small>Simulação para validação da experiência.</small>
        </aside>
      </div>
    </div>
  )
}
