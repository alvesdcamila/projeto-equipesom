import type { ProposalDocumentTheme, ProposalDocumentThemeId } from './types'

// Hipóteses visuais para validação com Camila. Não constituem identidade aprovada.
export const proposalDocumentThemes: ProposalDocumentTheme[] = [
  {
    id: 'tecnico-litoraneo',
    name: 'Técnico Litorâneo',
    description: 'Confiança, litoral e competência técnica sem aparência caricata.',
    tokens: {
      ink: '#12343B',
      accent: '#0F766E',
      soft: '#D9C7A3',
      paper: '#FCFBF7',
    },
  },
  {
    id: 'verao-profissional',
    name: 'Verão Profissional',
    description: 'Proximidade, energia e acolhimento em ameixa e terracota.',
    tokens: {
      ink: '#4A2432',
      accent: '#B64C2F',
      soft: '#F0C7A3',
      paper: '#FFF9F3',
    },
  },
]

export function getProposalDocumentTheme(themeId: ProposalDocumentThemeId): ProposalDocumentTheme {
  return proposalDocumentThemes.find((theme) => theme.id === themeId) ?? proposalDocumentThemes[0]
}
