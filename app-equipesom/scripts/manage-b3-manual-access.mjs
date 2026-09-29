import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Acesso descartável para Camila validar manualmente a interface B3 no Mac.
// Usa apenas loopback, domínio example.invalid e dados fictícios identificados.
const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const statePath = path.join(projectRoot, 'tmp', 'b3-manual-access.json')
const container = 'supabase_db_consolegroup-access-proof'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const localCli = process.platform === 'win32' ? '.\\node_modules\\.bin\\supabase.cmd' : './node_modules/.bin/supabase'
const action = process.argv[2]

if (!['prepare', 'cleanup'].includes(action)) {
  throw new Error('Use prepare ou cleanup para gerenciar o acesso manual B3.')
}

function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    windowsHide: true,
    ...options,
  })
  if (result.error || result.status !== 0) {
    throw new Error(`${binary} falhou ao gerenciar o acesso manual B3.`)
  }
  return result.stdout
}

function localStatus() {
  const status = JSON.parse(command(localCli, ['status', '--output', 'json'], {
    shell: process.platform === 'win32',
  }))
  const apiUrl = new URL(status.API_URL)
  if (!['127.0.0.1', 'localhost', '::1'].includes(apiUrl.hostname)
    || !['http:', 'https:'].includes(apiUrl.protocol)
    || typeof status.PUBLISHABLE_KEY !== 'string'
    || !status.PUBLISHABLE_KEY.startsWith('sb_publishable_')
    || typeof status.SERVICE_ROLE_KEY !== 'string'
    || !status.SERVICE_ROLE_KEY) {
    throw new Error('O acesso manual B3 exige a stack Supabase exclusivamente local.')
  }
  return { status, apiUrl }
}

function request(apiUrl, status, pathname, {
  method = 'GET',
  key = status.PUBLISHABLE_KEY,
  token = key,
  body,
} = {}) {
  const target = new URL(pathname, apiUrl)
  const payload = body === undefined ? undefined : JSON.stringify(body)
  const transport = target.protocol === 'https:' ? https : http
  const agent = target.protocol === 'https:' ? new https.Agent({ rejectUnauthorized: false }) : undefined

  return new Promise((resolve, reject) => {
    const req = transport.request(target, {
      method,
      agent,
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        ...(payload ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        } : {}),
      },
    }, (response) => {
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        let data = null
        try { data = raw ? JSON.parse(raw) : null } catch { data = raw }
        resolve({ status: response.statusCode, data })
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

function uuid(value, label) {
  assert.match(value, uuidPattern, `${label} inválido.`)
  return value
}

function validateState(value) {
  assert.equal(value.version, 1)
  assert.match(value.email, /^camila-b3-manual-[a-z0-9]+@example\.invalid$/)
  assert.ok(value.password.startsWith('B3m-'))
  for (const key of ['userId', 'roleId', 'tenantId', 'proposalId']) uuid(value[key], key)
  return value
}

async function stateExists() {
  try {
    await fs.access(statePath)
    return true
  } catch {
    return false
  }
}

async function prepare() {
  if (await stateExists()) {
    throw new Error('Já existe um acesso manual B3. Execute a limpeza antes de preparar outro.')
  }

  const { status, apiUrl } = localStatus()
  const runId = randomUUID().slice(0, 8)
  const roleId = randomUUID()
  const tenantId = randomUUID()
  const proposalId = randomUUID()
  const email = `camila-b3-manual-${runId}@example.invalid`
  const password = `B3m-${randomBytes(18).toString('base64url')}!`
  let userId = null
  let seeded = false

  try {
    const created = await request(apiUrl, status, '/auth/v1/admin/users', {
      method: 'POST',
      key: status.SERVICE_ROLE_KEY,
      body: {
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Camila — validação manual B3' },
      },
    })
    assert.equal(created.status, 200, 'Não foi possível criar a conta fictícia local.')
    userId = uuid(created.data.id, 'userId')

    sql(`begin;
      insert into public.roles (id, code, name, scope)
        values ('${uuid(roleId, 'roleId')}', 'b3_manual_${runId}', 'Papel fictício B3 manual', 'tenant');
      insert into public.tenants (id, name)
        values ('${uuid(tenantId, 'tenantId')}', 'EQUIPESOM — VALIDAÇÃO FICTÍCIA B3');
      insert into public.memberships (user_id, tenant_id, role_id)
        values ('${userId}', '${tenantId}', '${roleId}');
      insert into public.proposals (id, tenant_id, created_by, status)
        values ('${uuid(proposalId, 'proposalId')}', '${tenantId}', '${userId}', 'draft');
      insert into public.proposal_drafts (proposal_id, tenant_id, content, updated_by)
        values ('${proposalId}', '${tenantId}', '{"title":"PROPOSTA FICTÍCIA PARA VALIDAÇÃO MANUAL B3"}', '${userId}');
      commit;`)
    seeded = true

    const state = {
      version: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      email,
      password,
      userId,
      roleId,
      tenantId,
      proposalId,
    }
    await fs.mkdir(path.dirname(statePath), { recursive: true })
    await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600, flag: 'wx' })

    console.log('ACESSO B3 MANUAL PREPARADO — SOMENTE LOCAL E FICTÍCIO')
    console.log('URL: http://127.0.0.1:5174/login')
    console.log(`E-mail: ${email}`)
    console.log(`Senha: ${password}`)
    console.log(`Prazo recomendado para limpeza: ${state.expiresAt}`)
    console.log('Após a validação, execute: npm run cleanup:b3-manual')
  } catch (cause) {
    if (seeded) {
      try {
        sql(`begin;
          delete from public.proposal_drafts where proposal_id = '${proposalId}';
          delete from public.proposals where id = '${proposalId}';
          delete from public.memberships where role_id = '${roleId}';
          delete from public.tenants where id = '${tenantId}';
          delete from public.roles where id = '${roleId}';
          commit;`)
      } catch {}
    }
    if (userId) {
      try {
        await request(apiUrl, status, `/auth/v1/admin/users/${userId}`, {
          method: 'DELETE', key: status.SERVICE_ROLE_KEY,
        })
      } catch {}
    }
    throw cause
  }
}

async function cleanup() {
  if (!await stateExists()) {
    throw new Error('Nenhum acesso manual B3 registrado para limpeza.')
  }

  const state = validateState(JSON.parse(await fs.readFile(statePath, 'utf8')))
  const { status, apiUrl } = localStatus()
  const { userId, roleId, tenantId, proposalId } = state

  sql(`begin;
    delete from public.proposal_drafts where proposal_id = '${proposalId}';
    delete from public.proposals where id = '${proposalId}';
    delete from public.memberships where user_id = '${userId}' and tenant_id = '${tenantId}';
    delete from public.tenants where id = '${tenantId}';
    delete from public.roles where id = '${roleId}';
    commit;`)

  const deleted = await request(apiUrl, status, `/auth/v1/admin/users/${userId}`, {
    method: 'DELETE', key: status.SERVICE_ROLE_KEY,
  })
  assert.ok([200, 204, 404].includes(deleted.status), 'Não foi possível remover a conta fictícia local.')

  const remaining = sql(`select
    (select count(*) from auth.users where id = '${userId}')
    + (select count(*) from public.roles where id = '${roleId}')
    + (select count(*) from public.tenants where id = '${tenantId}')
    + (select count(*) from public.memberships where user_id = '${userId}')
    + (select count(*) from public.proposals where id = '${proposalId}')
    + (select count(*) from public.proposal_drafts where proposal_id = '${proposalId}');`).trim()
  assert.equal(remaining, '0', 'A limpeza B3 manual deixou registros fictícios.')

  await fs.unlink(statePath)
  console.log('PASS: acesso manual B3 removido; zero contas, vínculos, tenants, propostas e rascunhos fictícios restantes.')
}

if (action === 'prepare') await prepare()
else await cleanup()
