import { pilotCompany } from '../config/company'
import { mockProposals } from '../data/mockData'
import type { ProposalListItem } from '../types/domain'
import { loadPrototypeState } from './prototypeStorage'

export interface ProposalStats {
  drafts: number
  sent: number
  upcomingEvents: number
}

export function getDisplayedProposals(): ProposalListItem[] {
  const localProposals = loadPrototypeState().state.localProposals

  return [...mockProposals, ...localProposals]
    .filter((proposal) => proposal.tenantId === pilotCompany.tenantId)
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt))
}

export function getProposalById(proposalId: string): ProposalListItem | undefined {
  return getDisplayedProposals().find((proposal) => proposal.id === proposalId)
}

export function getProposalStats(proposals: ProposalListItem[], now = new Date()): ProposalStats {
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return {
    drafts: proposals.filter((proposal) => proposal.status === 'rascunho').length,
    sent: proposals.filter((proposal) => proposal.status === 'enviada').length,
    upcomingEvents: proposals.filter((proposal) => proposal.version.eventDate >= today).length,
  }
}
