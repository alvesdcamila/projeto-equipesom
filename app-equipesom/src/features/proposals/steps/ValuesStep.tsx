import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { DecimalInput } from '../../../components/forms/DecimalInput'
import { FieldError } from '../../../components/forms/FieldError'
import type { ProposalStepProps } from '../types'
import { formatCurrency } from '../../../utils/formatters'
import { calculateDraftAmounts } from '../../../utils/proposalAmounts'

function formatPercentage(value: number | null): string {
  if (value === null) return 'PENDENTE'
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)}%`
}

export function ValuesStep({ draft, onChange, errors }: ProposalStepProps) {
  const amounts = calculateDraftAmounts(draft)

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
              <DecimalInput
                id="baseValue"
                value={draft.baseValue}
                onValueChange={(value) => onChange('baseValue', value)}
                aria-invalid={Boolean(errors.baseValue)}
                aria-describedby={errors.baseValue ? 'baseValue-error' : undefined}
              />
            </div>
            <FieldError id="baseValue-error" message={errors.baseValue} />
          </label>
          <label className={`form-field ${errors.travelFee ? 'is-invalid' : ''}`} htmlFor="travelFee">
            <span>Deslocamento</span>
            <div className={`money-input ${errors.travelFee ? 'is-invalid' : ''}`}>
              <span>R$</span>
              <DecimalInput
                id="travelFee"
                value={draft.travelFee}
                onValueChange={(value) => onChange('travelFee', value)}
                aria-invalid={Boolean(errors.travelFee)}
                aria-describedby={errors.travelFee ? 'travelFee-error' : undefined}
              />
            </div>
            <FieldError id="travelFee-error" message={errors.travelFee} />
          </label>
          <label className={`form-field ${errors.discountPercentage ? 'is-invalid' : ''}`} htmlFor="discountPercentage">
            <span>Desconto autorizado (%) <em>provisório</em></span>
            <div className={`suffix-input ${errors.discountPercentage ? 'is-invalid' : ''}`}>
              <DecimalInput
                id="discountPercentage"
                value={draft.discountPercentage}
                onValueChange={(value) => onChange('discountPercentage', value)}
                aria-invalid={Boolean(errors.discountPercentage)}
                aria-describedby={errors.discountPercentage ? 'discountPercentage-error' : 'discountPercentage-help'}
              />
              <span>%</span>
            </div>
            <small className="field-help" id="discountPercentage-help"><ShieldCheck size={14} /> No processo atual, descontos dependem de autorização.</small>
            <FieldError id="discountPercentage-error" message={errors.discountPercentage} />
          </label>
        </div>

        {draft.legacyFixedDiscount && (
          <div className="info-banner info-banner--warning" role="alert">
            <AlertTriangle size={19} />
            <p>
              Este rascunho possuía desconto fixo de <strong>{formatCurrency(draft.legacyFixedDiscount.amount)}</strong>.
              O total anterior foi preservado, mas o desconto precisa ser redefinido como percentual antes de concluir.
            </p>
          </div>
        )}

        <aside className="total-card">
          <span>Valor total depois do desconto</span>
          <strong>{formatCurrency(amounts.total)}</strong>
          <div className="total-card__line"><span>Serviços e equipamentos</span><b>{formatCurrency(amounts.baseValue)}</b></div>
          <div className="total-card__line"><span>Deslocamento</span><b>{formatCurrency(amounts.travelFee)}</b></div>
          <div className="total-card__line"><span>Subtotal</span><b>{formatCurrency(amounts.subtotalBeforeDiscount)}</b></div>
          <div className="total-card__line"><span>Desconto ({formatPercentage(amounts.discountPercentage)})</span><b>− {formatCurrency(amounts.discountAmount)}</b></div>
          <small>Simulação para validação da experiência.</small>
        </aside>
      </div>
    </div>
  )
}
