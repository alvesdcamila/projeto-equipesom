import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { platformBrand } from '../config/platform'
import { useB3LocalSession } from '../components/auth/B3LocalSession'
import { readB3Proposals, type B3ProposalSummary } from '../services/b3LocalBackend'

function formatAmount(proposal: B3ProposalSummary) {
  if (proposal.totalAmount === null || !proposal.currency) return 'Ainda sem valor emitido'
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: proposal.currency,
    }).format(proposal.totalAmount)
  } catch {
    return `${proposal.currency} ${proposal.totalAmount.toFixed(2)}`
  }
}

export function B3LocalProposalsPage() {
  const { session, signOut } = useB3LocalSession()
  const [tenantId, setTenantId] = useState(session?.context.memberships[0]?.tenantId ?? '')
  const [proposals, setProposals] = useState<B3ProposalSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session || !tenantId) return
    let cancelled = false
    readB3Proposals(session, tenantId)
      .then((result) => { if (!cancelled) setProposals(result) })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Consulta indisponível.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [session, tenantId])

  function selectTenant(nextTenantId: string) {
    setLoading(true)
    setError('')
    setProposals([])
    setTenantId(nextTenantId)
  }

  if (!session) return null

  return (
    <main className="b3-readonly-page">
      <header className="b3-readonly-page__header">
        <img src={platformBrand.logo} alt={platformBrand.name} />
        <button type="button" onClick={signOut}>Encerrar acesso nesta aba</button>
      </header>
      <div className="b3-readonly-page__content">
        <span className="eyebrow">Prova B3 · somente ambiente local</span>
        <h1>Propostas do banco</h1>
        <p>Consulta autorizada por sessão e vínculo. Esta área não cria, edita, emite ou envia propostas.</p>
        <p className="b3-readonly-page__separation">
          Os dados do banco não são combinados com o protótipo do navegador.{' '}
          <Link to="/propostas">Abrir propostas do protótipo</Link>
        </p>

        <div className="b3-readonly-page__context">
          <span>Pessoa: {session.context.user.displayName || 'Usuário fictício'}</span>
          <label htmlFor="b3-tenant">Empresa vinculada</label>
          <select id="b3-tenant" value={tenantId} onChange={(event) => selectTenant(event.target.value)}>
            {session.context.memberships.map((membership) => (
              <option key={membership.tenantId} value={membership.tenantId}>
                {membership.tenantName}
              </option>
            ))}
          </select>
        </div>

        {loading ? <p role="status">Consultando propostas autorizadas...</p> : null}
        {error ? <p className="b3-readonly-page__error" role="alert">{error}</p> : null}
        {!loading && !error && proposals.length === 0 ? (
          <p role="status">Nenhuma proposta cadastrada para este vínculo de teste.</p>
        ) : null}
        {!loading && !error && proposals.length > 0 ? (
          <ul className="b3-readonly-page__list">
            {proposals.map((proposal) => (
              <li key={proposal.id}>
                <strong>{proposal.officialNumber || 'Rascunho sem número'}</strong>
                <span>{proposal.status === 'issued' ? 'Emitida' : 'Rascunho'}</span>
                <span>{proposal.versionNumber ? `Versão ${proposal.versionNumber}` : 'Sem versão emitida'}</span>
                <span>{formatAmount(proposal)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  )
}
