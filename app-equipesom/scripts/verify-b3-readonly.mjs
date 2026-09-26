import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

// Prova B3 exclusivamente local. Todos os usuários, tenants e propostas são fictícios,
// usados apenas durante esta execução e removidos no finally; nenhuma chave é exibida.
const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const container = 'supabase_db_consolegroup-access-proof'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const localCli = process.platform === 'win32' ? '.\\node_modules\\.bin\\supabase.cmd' : './node_modules/.bin/supabase'

function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, { cwd: projectRoot, encoding: 'utf8', windowsHide: true, ...options })
  if (result.error || result.status !== 0) throw new Error(`${binary} falhou na prova B3 local.`)
  return result.stdout
}

const status = JSON.parse(command(localCli, ['status', '--output', 'json'], { shell: process.platform === 'win32' }))
const apiUrl = new URL(status.API_URL)
if (!['127.0.0.1', 'localhost', '::1'].includes(apiUrl.hostname) || !['http:', 'https:'].includes(apiUrl.protocol)
  || typeof status.PUBLISHABLE_KEY !== 'string' || !status.PUBLISHABLE_KEY.startsWith('sb_publishable_')
  || !status.SERVICE_ROLE_KEY) throw new Error('A prova B3 exige a stack Supabase local e chaves geradas pela CLI.')
const agent = apiUrl.protocol === 'https:' ? new https.Agent({ rejectUnauthorized: false }) : undefined

function request(path, { method = 'GET', key = status.PUBLISHABLE_KEY, token = key, body } = {}) {
  const target = new URL(path, apiUrl)
  const payload = body === undefined ? undefined : JSON.stringify(body)
  const transport = target.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const req = transport.request(target, {
      method, agent,
      headers: { apikey: key, Authorization: `Bearer ${token}`,
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}) },
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        let data = null
        try { data = raw ? JSON.parse(raw) : null } catch { reject(new Error('Resposta local não JSON.')); return }
        resolve({ status: res.statusCode, data })
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

function sql(statement) {
  return command('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atq'], { input: statement })
}
function id(value) { assert.match(value, uuidPattern); return value }
function expect(response, code, label) { assert.equal(response.status, code, `${label}: HTTP ${response.status}`); return response.data }

const runId = randomUUID().slice(0, 8)
const roleId = randomUUID(); const tenantA = randomUUID(); const tenantB = randomUUID()
const proposalA = randomUUID(); const proposalB = randomUUID(); const createdUsers = []
let seeded = false; let outcome = null

async function createFakeUser(suffix) {
  const email = `b3-${runId}-${suffix}@example.invalid`
  const password = `B3a${randomBytes(14).toString('hex')}`
  const user = expect(await request('/auth/v1/admin/users', {
    method: 'POST', key: status.SERVICE_ROLE_KEY,
    body: { email, password, email_confirm: true, user_metadata: { full_name: `Usuário Fictício B3 ${suffix}` } },
  }), 200, 'Criação de conta fictícia')
  createdUsers.push(id(user.id)); return { id: user.id, email, password }
}
async function signIn(user) {
  const session = expect(await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: user.email, password: user.password } }), 200, 'Login fictício')
  assert.ok(session.access_token); return session.access_token
}
async function context(token) { return expect(await request('/rest/v1/rpc/current_access_context', { method: 'POST', token, body: {} }), 200, 'Contexto de acesso') }
async function proposals(token, tenantId) {
  return expect(await request(`/rest/v1/proposals?select=id,tenant_id,status&tenant_id=eq.${tenantId}`, { token }), 200, 'Leitura autorizada de propostas')
}

try {
  const userA = await createFakeUser('a'); const userB = await createFakeUser('b'); const noMembership = await createFakeUser('sem-vinculo')
  const tokenA = await signIn(userA); const tokenB = await signIn(userB); const tokenNoMembership = await signIn(noMembership)
  sql(`begin;
    insert into public.roles (id, code, name, scope) values ('${id(roleId)}', 'b3_local_${runId}', 'Papel fictício B3', 'tenant');
    insert into public.tenants (id, name) values ('${id(tenantA)}', 'Tenant Fictício B3 A'), ('${id(tenantB)}', 'Tenant Fictício B3 B');
    insert into public.memberships (user_id, tenant_id, role_id) values
      ('${id(userA.id)}', '${id(tenantA)}', '${id(roleId)}'), ('${id(userB.id)}', '${id(tenantB)}', '${id(roleId)}');
    insert into public.proposals (id, tenant_id, created_by, status) values
      ('${id(proposalA)}', '${id(tenantA)}', '${id(userA.id)}', 'draft'), ('${id(proposalB)}', '${id(tenantB)}', '${id(userB.id)}', 'draft');
    insert into public.proposal_drafts (proposal_id, tenant_id, content, updated_by) values
      ('${id(proposalA)}', '${id(tenantA)}', '{"title":"Proposta fictícia B3 A"}', '${id(userA.id)}'),
      ('${id(proposalB)}', '${id(tenantB)}', '{"title":"Proposta fictícia B3 B"}', '${id(userB.id)}');
    commit;`)
  seeded = true

  const contextA = await context(tokenA); const contextB = await context(tokenB); const contextNone = await context(tokenNoMembership)
  assert.deepEqual(contextA.memberships.map((item) => item.tenantId), [tenantA])
  assert.deepEqual(contextB.memberships.map((item) => item.tenantId), [tenantB])
  assert.deepEqual(contextNone.memberships, [])
  assert.deepEqual((await proposals(tokenA, tenantA)).map((item) => item.id), [proposalA])
  assert.deepEqual((await proposals(tokenB, tenantB)).map((item) => item.id), [proposalB])
  assert.deepEqual(await proposals(tokenA, tenantB), [])
  assert.notEqual((await request(`/rest/v1/proposals?select=id&tenant_id=eq.${tenantA}`)).status, 200, 'Anônimo sem leitura')
  assert.equal((await sql("select count(*) from public.proposal_emission_settings where b2_test_enabled")).trim(), '0', 'B2 continua desligado')
  outcome = 'PASS: login local, leitura somente leitura e isolamento entre tenants verificados com massa fictícia.'
} finally {
  let cleanupFailed = false
  if (seeded) {
    try { sql(`begin;
      delete from public.proposal_drafts where proposal_id in ('${id(proposalA)}','${id(proposalB)}');
      delete from public.proposals where id in ('${id(proposalA)}','${id(proposalB)}');
      delete from public.memberships where role_id = '${id(roleId)}';
      delete from public.tenants where id in ('${id(tenantA)}','${id(tenantB)}');
      delete from public.roles where id = '${id(roleId)}'; commit;`) } catch { cleanupFailed = true }
  }
  for (const userId of createdUsers) {
    try { const deleted = await request(`/auth/v1/admin/users/${id(userId)}`, { method: 'DELETE', key: status.SERVICE_ROLE_KEY }); if (deleted.status !== 200 && deleted.status !== 204) cleanupFailed = true } catch { cleanupFailed = true }
  }
  if (cleanupFailed) throw new Error('Limpeza da massa fictícia B3 incompleta.')
}
console.log(outcome)
console.log('Massa fictícia B3 removida; nenhuma chave, token ou dado real foi persistido.')
