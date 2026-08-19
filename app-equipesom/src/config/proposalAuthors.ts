// Compatibilidade exclusiva com rascunhos gravados antes do formato v3.
const legacyProposalAuthorNames: Record<string, string> = {
  'user-camila': 'Camila',
  'user-edevaldo-alves': 'Edevaldo Alves',
}

export function getLegacyProposalAuthorName(userId: string): string {
  return legacyProposalAuthorNames[userId] ?? ''
}
