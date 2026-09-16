import { useState } from 'react'
import { CheckCircle2, History, PencilLine, Plus, RotateCcw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { normalizePilotDraftField } from '../../config/pilotTextNormalization'
import {
  clearActiveDraft,
  completeActiveDraft,
  createCleanDraft,
  loadPrototypeState,
  saveActiveDraft,
  startEditingProposal,
  updateExistingDraft,
} from '../../services/prototypeStorage'
import type { ProposalDraft } from '../../types/domain'
import { formatDateTime } from '../../utils/formatters'
import { isValidDiscountPercentage } from '../../utils/proposalAmounts'
import { ProposalStepActions } from './ProposalStepActions'
import { ProposalStepIndicator } from './ProposalStepIndicator'
import { ClientStep } from './steps/ClientStep'
import { ConditionsStep } from './steps/ConditionsStep'
import { EventStep } from './steps/EventStep'
import { ReviewStep } from './steps/ReviewStep'
import { ServicesStep } from './steps/ServicesStep'
import { ValuesStep } from './steps/ValuesStep'
import type { DraftUpdater } from './types'
import {
  groupValidationIssues,
  validateAllSteps,
  validateStep,
  type ValidationErrors,
} from './validation'
import { wizardSteps } from './wizardSteps'

interface ProposalWizardProps {
  editingProposalId?: string
}

export function ProposalWizard({ editingProposalId }: ProposalWizardProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(editingProposalId)
  const [initialContext] = useState(() => {
    const loaded = loadPrototypeState()
    if (editingProposalId) {
      const matchingActive = loaded.state.activeDraft?.editingProposalId === editingProposalId
        ? loaded.state.activeDraft
        : null
      const activeDraft = matchingActive ?? startEditingProposal(editingProposalId)
      return {
        activeDraft,
        issue: loaded.issue ?? (activeDraft ? '' : 'Não foi possível iniciar a edição neste dispositivo.'),
        recovered: Boolean(matchingActive),
      }
    }

    const activeDraft = loaded.state.activeDraft?.editingProposalId === null
      ? loaded.state.activeDraft
      : null
    return { activeDraft, issue: loaded.issue ?? '', recovered: Boolean(activeDraft) }
  })

  const recoveredDraft = initialContext.activeDraft
  const [draft, setDraft] = useState<ProposalDraft>(() => recoveredDraft?.draft ?? createCleanDraft())
  const [currentStep, setCurrentStep] = useState(() => recoveredDraft?.currentStep ?? 0)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [feedback, setFeedback] = useState(initialContext.issue)
  const [savedAt, setSavedAt] = useState<string | null>(recoveredDraft?.savedAt ?? null)
  const [wasRecovered, setWasRecovered] = useState(initialContext.recovered)
  const [completedProposalId, setCompletedProposalId] = useState<string | null>(null)

  const updateDraft: DraftUpdater = (field, value) => {
    const normalizedValue = normalizePilotDraftField(field, value)
    setDraft((current) => ({
      ...current,
      [field]: normalizedValue,
      ...(field === 'discountPercentage' && isValidDiscountPercentage(normalizedValue)
        ? { legacyFixedDiscount: undefined }
        : {}),
    }))
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === 'serviceIds' || field === 'equipmentItems' ? { equipmentItems: undefined } : {}),
      ...(field === 'clientType' ? { clientDocument: undefined } : {}),
    }))
    setFeedback('Alterações ainda não salvas')
  }

  const focusFirstError = () => {
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    })
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goNext = () => {
    const stepErrors = validateStep(currentStep, draft)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setFeedback('Revise os campos destacados antes de continuar.')
      focusFirstError()
      return
    }

    if (currentStep === wizardSteps.length - 1) {
      const allErrors = validateAllSteps(draft)
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors)
        setFeedback('Ainda existem dados obrigatórios pendentes.')
        document.getElementById('review-pending-summary')?.focus()
        return
      }

      if (editingProposalId) {
        const updated = updateExistingDraft(editingProposalId, draft)
        if (!updated) {
          setFeedback('Não foi possível salvar as alterações deste rascunho.')
          return
        }
        navigate(`/propostas/${encodeURIComponent(updated.id)}`, { replace: true })
        return
      }

      const completed = completeActiveDraft(draft)
      if (!completed) {
        setFeedback('Não foi possível armazenar o rascunho neste dispositivo.')
        return
      }

      setCompletedProposalId(completed.id)
      setSavedAt(null)
      setWasRecovered(false)
      setDraft(createCleanDraft())
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setErrors({})
    goToStep(currentStep + 1)
  }

  const saveDraft = () => {
    const saved = saveActiveDraft(draft, currentStep, editingProposalId ?? null)
    if (!saved) {
      setFeedback('Não foi possível salvar o rascunho neste dispositivo.')
      return
    }

    setDraft(saved.draft)
    setSavedAt(saved.savedAt)
    setWasRecovered(false)
    setFeedback(`${isEditing ? 'Edição' : 'Rascunho'} salva em ${formatDateTime(saved.savedAt)}.`)
  }

  const startCleanDraft = () => {
    const cleared = clearActiveDraft()
    setDraft(createCleanDraft())
    setCurrentStep(0)
    setErrors({})
    setSavedAt(null)
    setWasRecovered(false)
    setFeedback(
      cleared
        ? 'Uma proposta limpa foi iniciada.'
        : 'Proposta limpa iniciada; o armazenamento local não estava disponível.',
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (completedProposalId) {
    return (
      <section className="completion-card" aria-live="polite">
        <div className="completion-card__icon"><CheckCircle2 size={34} /></div>
        <span className="eyebrow">Rascunho concluído</span>
        <h2>Proposta pronta para revisão final</h2>
        <p>
          O rascunho <strong>#{completedProposalId}</strong> foi salvo neste dispositivo.
          Confira o documento e escolha a direção de cor antes de emitir.
        </p>
        <div className="completion-card__actions">
          <button className="button button--secondary" type="button" onClick={() => setCompletedProposalId(null)}>
            <Plus size={18} /> Criar outra proposta
          </button>
          <Link className="button button--primary" to={`/propostas/${encodeURIComponent(completedProposalId)}/previa`}>
            Revisar e emitir
          </Link>
        </div>
      </section>
    )
  }

  const reviewIssues = groupValidationIssues(draft)

  return (
    <div className="proposal-wizard">
      {isEditing && editingProposalId && (
        <section className="draft-status-banner is-editing" role="status">
          <div className="draft-status-banner__icon"><PencilLine size={19} /></div>
          <div>
            <strong>{wasRecovered ? 'Edição recuperada' : 'Editando rascunho existente'}</strong>
            <span>#{editingProposalId}{savedAt ? ` · gravação local em ${formatDateTime(savedAt)}` : ''}</span>
          </div>
        </section>
      )}

      {!isEditing && savedAt && (
        <section className={wasRecovered ? 'draft-status-banner is-recovered' : 'draft-status-banner'} role="status">
          <div className="draft-status-banner__icon"><History size={19} /></div>
          <div>
            <strong>{wasRecovered ? 'Rascunho recuperado' : 'Rascunho salvo neste dispositivo'}</strong>
            <span>Última gravação em {formatDateTime(savedAt)}</span>
          </div>
          <button type="button" onClick={startCleanDraft}>
            <RotateCcw size={15} /> Iniciar proposta limpa
          </button>
        </section>
      )}

      <ProposalStepIndicator currentStep={currentStep} />

      <form className="wizard-panel" onSubmit={(event) => event.preventDefault()} noValidate>
        {currentStep === 0 && <ClientStep draft={draft} onChange={updateDraft} errors={errors} />}
        {currentStep === 1 && <EventStep draft={draft} onChange={updateDraft} errors={errors} />}
        {currentStep === 2 && <ServicesStep draft={draft} onChange={updateDraft} errors={errors} />}
        {currentStep === 3 && <ValuesStep draft={draft} onChange={updateDraft} errors={errors} />}
        {currentStep === 4 && <ConditionsStep draft={draft} onChange={updateDraft} errors={errors} />}
        {currentStep === 5 && <ReviewStep draft={draft} onEdit={goToStep} issues={reviewIssues} isEditing={isEditing} />}
      </form>

      <div className="draft-feedback" aria-live="polite">{feedback}</div>
      <ProposalStepActions
        currentStep={currentStep}
        totalSteps={wizardSteps.length}
        onBack={() => goToStep(Math.max(0, currentStep - 1))}
        onNext={goNext}
        onSaveDraft={saveDraft}
        canComplete={reviewIssues.length === 0}
        completionLabel={isEditing ? 'Salvar alterações' : 'Concluir rascunho'}
      />
    </div>
  )
}
