export type ProposalPresentationContext = 'internalDraft' | 'documentPreview' | 'emittedDocument'

interface ProposalPresentationCopy {
  identification?: string
  valuesTitle: string
  notice?: string
  audience: 'internal' | 'client'
  immutable: boolean
}

export const proposalPresentation: Record<ProposalPresentationContext, ProposalPresentationCopy> = {
  internalDraft: {
    identification: 'Rascunho',
    valuesTitle: 'Valores',
    notice: 'Valores ainda editáveis. Nenhuma proposta foi emitida ou enviada ao cliente.',
    audience: 'internal',
    immutable: false,
  },
  documentPreview: {
    // Recomendação de apresentação ainda sujeita à aprovação de Camila no modelo visual.
    valuesTitle: 'Investimento',
    audience: 'client',
    immutable: false,
  },
  emittedDocument: {
    valuesTitle: 'Investimento',
    audience: 'client',
    immutable: true,
  },
}
