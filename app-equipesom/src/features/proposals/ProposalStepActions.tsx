import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react'

interface ProposalStepActionsProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSaveDraft: () => void
  canComplete: boolean
  completionLabel?: string
}

export function ProposalStepActions({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  canComplete,
  completionLabel = 'Concluir rascunho',
}: ProposalStepActionsProps) {
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="wizard-actions">
      <button
        className="button button--ghost"
        type="button"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        <ArrowLeft size={18} /> Voltar
      </button>
      <button className="save-draft-button" type="button" onClick={onSaveDraft}>
        <Save size={17} /> Salvar rascunho
      </button>
      <button
        className="button button--primary"
        type="button"
        onClick={onNext}
        disabled={isLastStep && !canComplete}
        aria-describedby={isLastStep && !canComplete ? 'review-pending-summary' : undefined}
      >
        {isLastStep ? (
          <><Check size={18} /> {completionLabel}</>
        ) : (
          <>Continuar <ArrowRight size={18} /></>
        )}
      </button>
    </div>
  )
}
