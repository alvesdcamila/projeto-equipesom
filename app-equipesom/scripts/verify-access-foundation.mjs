import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const readProjectFile = (path) => readFileSync(`${projectRoot}/${path}`, 'utf8')

const migration = readProjectFile(
  'supabase/migrations/20260902193000_access_foundation_probe.sql',
)
const test = readProjectFile('supabase/tests/database/access_foundation.test.sql')
const seed = readProjectFile('supabase/seed.sql')
const config = readProjectFile('supabase/config.toml')

for (const table of [
  'roles',
  'tenants',
  'app_users',
  'memberships',
  'signup_requests',
  'commercial_activations',
  'invitations',
  'session_revocations',
  'audit_events',
  'proposal_probe',
]) {
  assert.match(migration, new RegExp(`create table public\\.${table} \\(`, 'i'))
}

for (const protectedTable of [
  'tenants',
  'memberships',
  'signup_requests',
  'commercial_activations',
  'invitations',
  'session_revocations',
  'audit_events',
  'proposal_probe',
]) {
  assert.match(
    migration,
    new RegExp(`alter table public\\.${protectedTable} enable row level security`, 'i'),
  )
}

assert.match(migration, /private\.has_active_membership\(tenant_id\)/)
assert.match(migration, /public\.accept_invitation\(invitation_token text\)/)
assert.match(migration, /i\.email = lower\(auth\.jwt\(\) ->> 'email'\)/)
assert.match(migration, /i\.status = 'pending'/)
assert.match(migration, /i\.expires_at > now\(\)/)
assert.match(migration, /status = 'pending_commercial_activation'/)
assert.match(migration, /revoke all on public\.invitations from anon, authenticated/)
assert.match(migration, /revoke all on public\.session_revocations from anon, authenticated/)

const tenantIds = new Set(test.match(/20000000-0000-4000-8000-00000000000[12]/g))
const userIds = new Set(test.match(/10000000-0000-4000-8000-00000000000[12]/g))
assert.equal(tenantIds.size, 2, 'a prova deve conter exatamente dois tenant_ids fictícios')
assert.equal(userIds.size, 2, 'a prova deve conter exatamente dois user_ids fictícios')

const assertionCount = [...test.matchAll(
  /select\s+(?:has_table|is|isnt|lives_ok|throws_like|throws_ok)\s*\(/gi,
)].length
const declaredPlan = Number(test.match(/select plan\((\d+)\)/)?.[1])
assert.equal(assertionCount, declaredPlan, 'o plano pgTAP deve corresponder às asserções')

assert.doesNotMatch(`${migration}\n${test}\n${seed}`, /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/)
assert.doesNotMatch(seed, /\binsert\s+into\b/i)
assert.match(test, /@example\.invalid/g)
assert.match(config, /project_id = "consolegroup-access-proof"/)
assert.match(config, /allowed_cidrs = \["127\.0\.0\.1\/32"\]/)
assert.match(config, /site_url = "http:\/\/127\.0\.0\.1:4173"/)

console.log(`Verificação estrutural concluída: ${declaredPlan} asserções pgTAP preparadas.`)
console.log('Esta checagem estática não substitui a execução em PostgreSQL/Supabase.')
