import { Check } from 'lucide-react'
import { wizardSteps } from './wizardSteps'

interface ProposalStepIndicatorProps {
  currentStep: number
}

export function ProposalStepIndicator({ currentStep }: ProposalStepIndicatorProps) {
  return (
    <div className="wizard-progress">
      <div className="wizard-progress__header">
        <span>Etapa {currentStep + 1} de {wizardSteps.length}</span>
        <strong>{wizardSteps[currentStep].label}</strong>
      </div>
      <div className="wizard-progress__track" aria-hidden="true">
        <span style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }} />
      </div>
      <ol className="wizard-steps" aria-label="Etapas da nova proposta">
        {wizardSteps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          return (
            <li
              key={step.id}
              className={`${isComplete ? 'is-complete' : ''} ${isCurrent ? 'is-current' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="wizard-steps__dot">
                {isComplete ? <Check size={13} /> : index + 1}
              </span>
              <span className="wizard-steps__label">{step.shortLabel}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
