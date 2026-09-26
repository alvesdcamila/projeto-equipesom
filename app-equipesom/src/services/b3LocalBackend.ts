import { runtimeEnvironment } from '../config/runtimeEnvironment'

const b3ProxyPrefix = '/__b3_supabase'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface B3Membership {
  tenantId: string
  tenantName: string
  roleCode: string
}

export interface B3AccessContext {
  user: { id: string; displayName: string | null }
  memberships: B3Membership[]
}

export interface B3Session {
  userId: string
  accessToken: string
  expiresAt: number
  context: B3AccessContext
}

export interface B3ProposalSummary {
  id: string
  tenantId: string
  status: 'draft' | 'issued'
  officialNumber: string | null
  updatedAt: string
  versionNumber: number | null
  totalAmount: number | null
  currency: string | null
}

export class B3AccessError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
  }
}

function publicKey() {
  if (!runtimeEnvironment.b3LocalAuthEnabled) {
    throw new B3AccessError('A consulta B3 está disponível apenas no modo de teste local.')
  }
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!key?.startsWith('sb_publishable_')) {
    throw new B3AccessError('A chave pública da stack local não está configurada.')
  }
  return key
}

async function request(path: string, token?: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${b3ProxyPrefix}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    cache: 'no-store',
    credentials: 'omit',
    headers: {
      apikey: publicKey(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }).catch(() => {
    throw new B3AccessError('O Supabase local não respondeu. Confira se a stack está ativa.')
  })

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new B3AccessError('Credenciais inválidas ou sessão expirada.', response.status)
    }
    if (response.status === 403) {
      throw new B3AccessError('Acesso não autorizado para esta empresa.', response.status)
    }
    if (response.status === 429) {
      throw new B3AccessError('Muitas tentativas. Aguarde antes de tentar novamente.', response.status)
    }
    throw new B3AccessError('A consulta local não pôde ser concluída.', response.status)
  }

  try {
    return await response.json()
  } catch {
    throw new B3AccessError('O serviço local retornou uma resposta inválida.')
  }
}

function accessContext(value: unknown): B3AccessContext | null {
  if (value === null) return null
  if (typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const user = record.user
  const memberships = record.memberships
  if (!user || typeof user !== 'object' || Array.isArray(user)
    || !Array.isArray(memberships)) return null
  const identity = user as Record<string, unknown>
  if (typeof identity.id !== 'string' || !uuidPattern.test(identity.id)
    || (identity.displayName !== null && typeof identity.displayName !== 'string')) return null

  const normalized: B3Membership[] = []
  for (const membership of memberships) {
    if (!membership || typeof membership !== 'object' || Array.isArray(membership)) return null
    const item = membership as Record<string, unknown>
    if (typeof item.tenantId !== 'string' || !uuidPattern.test(item.tenantId)
      || typeof item.tenantName !== 'string' || typeof item.roleCode !== 'string') return null
    normalized.push({
      tenantId: item.tenantId,
      tenantName: item.tenantName,
      roleCode: item.roleCode,
    })
  }
  return {
    user: { id: identity.id, displayName: identity.displayName },
    memberships: normalized,
  }
}

async function loadAccessContext(token: string): Promise<B3AccessContext | null> {
  return accessContext(await request('/rest/v1/rpc/current_access_context', token, {}))
}

export async function signInToB3(email: string, password: string): Promise<B3Session> {
  if (!email.trim() || !password) throw new B3AccessError('Informe e-mail e senha.')

  const result = await request('/auth/v1/token?grant_type=password', undefined, {
    email: email.trim(), password,
  }) as Record<string, unknown>

  if (typeof result.access_token !== 'string' || !result.access_token
    || typeof result.expires_in !== 'number' || result.expires_in <= 0) {
    throw new B3AccessError('O serviço local não retornou uma sessão válida.')
  }

  // A identidade é verificada no Auth; o JWT sozinho não libera um tenant.
  const user = await request('/auth/v1/user', result.access_token) as Record<string, unknown>
  const context = await loadAccessContext(result.access_token)
  if (typeof user.id !== 'string' || !uuidPattern.test(user.id)
    || !context || context.user.id !== user.id) {
    throw new B3AccessError('Não foi possível validar a identidade nesta sessão.')
  }
  if (context.memberships.length === 0) {
    throw new B3AccessError('Esta conta não possui vínculo ativo com uma empresa.')
  }

  return {
    userId: user.id,
    accessToken: result.access_token,
    expiresAt: Date.now() + result.expires_in * 1000,
    context,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function readB3Proposals(session: B3Session, tenantId: string): Promise<B3ProposalSummary[]> {
  if (!uuidPattern.test(tenantId) || Date.now() >= session.expiresAt) {
    throw new B3AccessError('Sessão expirada ou empresa inválida.', 401)
  }

  // O vínculo é revisto a cada leitura; a proteção efetiva continua na RLS do banco.
  const freshContext = await loadAccessContext(session.accessToken)
  if (freshContext?.user.id !== session.userId
    || !freshContext.memberships.some((item) => item.tenantId === tenantId)) {
    throw new B3AccessError('Acesso não autorizado para esta empresa.', 403)
  }

  const proposalsQuery = new URLSearchParams({
    select: 'id,tenant_id,status,official_number,updated_at',
    tenant_id: `eq.${tenantId}`,
    order: 'updated_at.desc',
  })
  const versionsQuery = new URLSearchParams({
    select: 'proposal_id,version_number,total_amount,currency',
    tenant_id: `eq.${tenantId}`,
    order: 'version_number.desc',
  })
  const [proposals, versions] = await Promise.all([
    request(`/rest/v1/proposals?${proposalsQuery}`, session.accessToken),
    request(`/rest/v1/proposal_versions?${versionsQuery}`, session.accessToken),
  ])
  if (!Array.isArray(proposals) || !Array.isArray(versions)) {
    throw new B3AccessError('O banco local retornou uma lista inválida.')
  }

  const latestVersion = new Map<string, Record<string, unknown>>()
  for (const value of versions) {
    if (!isRecord(value) || typeof value.proposal_id !== 'string') {
      throw new B3AccessError('O banco local retornou uma versão inválida.')
    }
    if (!latestVersion.has(value.proposal_id)) latestVersion.set(value.proposal_id, value)
  }

  return proposals.map((value) => {
    if (!isRecord(value) || typeof value.id !== 'string'
      || value.tenant_id !== tenantId
      || (value.status !== 'draft' && value.status !== 'issued')
      || typeof value.updated_at !== 'string') {
      throw new B3AccessError('O banco local retornou uma proposta inválida.')
    }
    const version = latestVersion.get(value.id)
    return {
      id: value.id,
      tenantId,
      status: value.status,
      officialNumber: typeof value.official_number === 'string' ? value.official_number : null,
      updatedAt: value.updated_at,
      versionNumber: typeof version?.version_number === 'number' ? version.version_number : null,
      totalAmount: typeof version?.total_amount === 'number' ? version.total_amount : null,
      currency: typeof version?.currency === 'string' ? version.currency : null,
    }
  })
}
