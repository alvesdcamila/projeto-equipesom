import type { ProposalDraft } from '../../types/domain'
import type { ValidationErrors } from './validation'

export type DraftUpdater = <K extends keyof ProposalDraft>(
  field: K,
  value: ProposalDraft[K],
) => void

export interface ProposalStepProps {
  draft: ProposalDraft
  onChange: DraftUpdater
  errors: ValidationErrors
}
