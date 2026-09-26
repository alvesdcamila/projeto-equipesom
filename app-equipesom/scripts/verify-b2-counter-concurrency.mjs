import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'

// Prova local do mesmo UPSERT da função B2, sem versão emitida persistente.
const container = 'supabase_db_consolegroup-access-proof'
const tenantId = randomUUID()
const testYear = 2099
const args = ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-Atq']

function runSql(statement) {
  const result = spawnSync('docker', args, { input: statement, encoding: 'utf8', windowsHide: true })
  if (result.error || result.status !== 0) {
    throw new Error(`Consulta PostgreSQL local falhou (código ${result.status ?? 'indisponível'}).`)
  }
  return result.stdout
}

function runSqlAsync(statement) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { windowsHide: true })
    let output = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stdin.on('error', reject)
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(output)
      else reject(new Error(`Sessão PostgreSQL local falhou (código ${code}).`))
    })
    child.stdin.end(statement)
  })
}

const allocate = `begin;
  insert into public.proposal_number_counters (tenant_id, issue_year, last_number)
  values ('${tenantId}', ${testYear}, 1)
  on conflict (tenant_id, issue_year)
  do update set last_number = public.proposal_number_counters.last_number + 1
    where public.proposal_number_counters.last_number < 9999
  returning last_number;
  select pg_sleep(0.25);
  commit;`

try {
  runSql(`insert into public.tenants (id, name)
    values ('${tenantId}', 'Tenant fictício B2 concorrência');`)

  const attempts = await Promise.allSettled([runSqlAsync(allocate), runSqlAsync(allocate)])
  for (const attempt of attempts) {
    if (attempt.status === 'rejected') throw attempt.reason
  }

  const numbers = attempts.map((attempt) => {
    const lines = attempt.value.trim().split(/\r?\n/).filter(Boolean)
    assert.equal(lines.length, 1, 'Cada sessão deve retornar exatamente um número')
    return Number(lines[0])
  }).sort((a, b) => a - b)

  assert.deepEqual(numbers, [1, 2], 'Emissões concorrentes devem receber sequências distintas')
  assert.equal(Number(runSql(`select last_number from public.proposal_number_counters
    where tenant_id = '${tenantId}' and issue_year = ${testYear};`).trim()), 2)
  console.log('PASS: duas alocações concorrentes no mesmo tenant/ano receberam 1 e 2.')
} finally {
  runSql(`begin;
    delete from public.proposal_number_counters where tenant_id = '${tenantId}';
    delete from public.tenants where id = '${tenantId}';
    commit;`)
}
