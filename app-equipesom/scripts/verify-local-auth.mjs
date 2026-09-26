import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

// Prova opt-in e exclusivamente local de B1. Chaves nunca são gravadas ou exibidas.
const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const container = 'supabase_db_consolegroup-access-proof'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    windowsHide: true,
    ...options,
  })
  if (result.error || result.status !== 0) {
    throw new Error(`${binary} falhou na prova local (código ${result.status ?? 'indisponível'}).`)
  }
  return result.stdout
}

const localCli = process.platform === 'win32'
  ? '.\\node_modules\\.bin\\supabase.cmd'
  : './node_modules/.bin/supabase'
const statusText = command(localCli, ['status', '--output', 'json'], {
  shell: process.platform === 'win32',
})
const status = JSON.parse(statusText)
const apiUrl = new URL(status.API_URL)

if (!['127.0.0.1', 'localhost', '::1'].includes(apiUrl.hostname)
  || !['http:', 'https:'].includes(apiUrl.protocol)
  || !status.ANON_KEY
  || !status.SERVICE_ROLE_KEY) {
  throw new Error('A prova exige a stack local e suas chaves geradas pela CLI.')
}

// A stack local usa certificado de desenvolvimento; esta exceção TLS nunca vale fora de loopback.
const agent = apiUrl.protocol === 'https:'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined

function request(path, { method = 'GET', key = status.ANON_KEY, token = key, body } = {}) {
  const target = new URL(path, apiUrl)
  const payload = body === undefined ? undefined : JSON.stringify(body)
  const transport = target.protocol === 'https:' ? https : http

  return new Promise((resolve, reject) => {
    const req = transport.request(target, {
      method,
      agent,
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        let data = null
        try {
          data = raw ? JSON.parse(raw) : null
        } catch {
          reject(new Error(`Resposta não JSON do serviço local (${res.statusCode}).`))
          return
        }
        resolve({ status: res.statusCode, data })
      })
    })
    req.on('error', reject)
    if (payload) req.write(payload)
    req.end()
  })
}

function sql(statement) {
  return command('docker', [
    'exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1', '-Atq',
  ], { input: statement })
}

function uuid(value) {
  assert.match(value, uuidPattern, 'Identificador da prova precisa ser UUID')
  return value
}

function jwtSessionId(token) {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
  return uuid(payload.session_id)
}

function expectStatus(response, expected, label) {
  assert.equal(response.status, expected, `${label}: HTTP ${response.status}`)
  return response.data
}

const runId = randomUUID().slice(0, 8)
const roleId = randomUUID()
const tenantA = randomUUID()
const tenantB = randomUUID()
const probeA = randomUUID()
const probeB = randomUUID()
const createdUsers = []
let seeded = false

async function createFakeUser(suffix) {
  const email = `b1-${runId}-${suffix}@example.invalid`
  const password = `B1a${randomBytes(14).toString('hex')}`
  const response = await request('/auth/v1/admin/users', {
    method: 'POST',
    key: status.SERVICE_ROLE_KEY,
    body: { email, password, email_confirm: true, user_metadata: { full_name: `Usuário Fictício ${suffix}` } },
  })
  const user = expectStatus(response, 200, 'Criação fictícia no Auth local')
  createdUsers.push(uuid(user.id))
  return { id: user.id, email, password }
}

async function signIn(user) {
  const response = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email: user.email, password: user.password },
  })
  const session = expectStatus(response, 200, 'Login fictício no Auth local')
  assert.ok(session.access_token, 'Auth deve emitir token de acesso')
  jwtSessionId(session.access_token)
  return session.access_token
}

async function context(token) {
  return expectStatus(await request('/rest/v1/rpc/current_access_context', {
    method: 'POST', token, body: {},
  }), 200, 'Contexto autenticado')
}

async function tenants(token) {
  return expectStatus(await request('/rest/v1/tenants?select=id&order=id', { token }), 200, 'Consulta de tenants')
}

let outcome = null
try {
  const userA = await createFakeUser('a')
  const userB = await createFakeUser('b')
  const noMembership = await createFakeUser('sem-vinculo')
  const tokenA = await signIn(userA)
  const tokenB = await signIn(userB)
  const tokenNoMembership = await signIn(noMembership)

  const authUser = expectStatus(await request('/auth/v1/user', { token: tokenA }), 200, 'Identidade validada pelo Auth')
  assert.equal(authUser.id, userA.id)

  sql(`begin;
    insert into public.roles (id, code, name, scope)
    values ('${uuid(roleId)}', 'b1_local_${runId}', 'Papel fictício B1', 'tenant');
    insert into public.tenants (id, name)
    values ('${uuid(tenantA)}', 'Tenant Fictício B1 A'), ('${uuid(tenantB)}', 'Tenant Fictício B1 B');
    insert into public.memberships (user_id, tenant_id, role_id)
    values ('${uuid(userA.id)}', '${uuid(tenantA)}', '${uuid(roleId)}'),
           ('${uuid(userB.id)}', '${uuid(tenantB)}', '${uuid(roleId)}');
    insert into public.proposal_probe (id, tenant_id, title, created_by)
    values ('${uuid(probeA)}', '${uuid(tenantA)}', 'Prova fictícia B1 A', '${uuid(userA.id)}'),
           ('${uuid(probeB)}', '${uuid(tenantB)}', 'Prova fictícia B1 B', '${uuid(userB.id)}');
    commit;`)
  seeded = true

  const contextA = await context(tokenA)
  const contextB = await context(tokenB)
  const contextWithoutMembership = await context(tokenNoMembership)
  assert.equal(contextA.user.id, userA.id)
  assert.deepEqual(contextA.memberships.map((item) => item.tenantId), [tenantA])
  assert.deepEqual(contextB.memberships.map((item) => item.tenantId), [tenantB])
  assert.deepEqual(contextWithoutMembership.memberships, [])
  assert.deepEqual((await tenants(tokenA)).map((item) => item.id), [tenantA])
  assert.deepEqual((await tenants(tokenB)).map((item) => item.id), [tenantB])
  assert.deepEqual(await tenants(tokenNoMembership), [])

  const crossTenant = await request(`/rest/v1/tenants?select=id&id=eq.${tenantB}`, { token: tokenA })
  assert.deepEqual(expectStatus(crossTenant, 200, 'Tentativa de tenant cruzado'), [])
  const crossProbe = await request(`/rest/v1/proposal_probe?select=id&tenant_id=eq.${tenantB}`, { token: tokenA })
  assert.deepEqual(expectStatus(crossProbe, 200, 'Tentativa de proposta cruzada'), [])

  const anonymous = await request('/rest/v1/tenants?select=id')
  assert.notEqual(anonymous.status, 200, 'Anônimo não deve consultar tenants')

  sql(`update public.memberships set status = 'suspended'
    where user_id = '${uuid(userA.id)}' and tenant_id = '${uuid(tenantA)}';`)
  assert.deepEqual((await context(tokenA)).memberships, [])
  assert.deepEqual(await tenants(tokenA), [])

  sql(`update public.memberships set status = 'active'
    where user_id = '${uuid(userA.id)}' and tenant_id = '${uuid(tenantA)}';
    insert into public.session_revocations (session_id, user_id, reason)
    values ('${jwtSessionId(tokenA)}', '${uuid(userA.id)}', 'Revogação fictícia B1');`)
  assert.equal(await context(tokenA), null)
  assert.deepEqual(await tenants(tokenA), [])

  outcome = 'PASS: Auth local, contexto, isolamento, suspensão e revogação verificados.'
} finally {
  let cleanupFailed = false
  if (seeded) {
    try {
      sql(`begin;
        delete from public.session_revocations where user_id in (${createdUsers.map((id) => `'${uuid(id)}'`).join(',')});
        delete from public.proposal_probe where id in ('${uuid(probeA)}', '${uuid(probeB)}');
        delete from public.memberships where role_id = '${uuid(roleId)}';
        delete from public.tenants where id in ('${uuid(tenantA)}', '${uuid(tenantB)}');
        delete from public.roles where id = '${uuid(roleId)}';
        commit;`)
    } catch {
      cleanupFailed = true
    }
  }
  for (const id of createdUsers) {
    try {
      const deleted = await request(`/auth/v1/admin/users/${uuid(id)}`, {
        method: 'DELETE', key: status.SERVICE_ROLE_KEY,
      })
      if (deleted.status !== 200 && deleted.status !== 204) cleanupFailed = true
    } catch {
      cleanupFailed = true
    }
  }
  if (cleanupFailed) {
    throw new Error('Limpeza da massa fictícia incompleta; confira somente os IDs desta execução no banco local.')
  }
}

console.log(outcome)
console.log('Massa fictícia removida; nenhuma chave ou token foi gravado.')
