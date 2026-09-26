import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Opt-in B3: publica ao Vite apenas a chave publicável da CLI local, nunca segredos.
const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const cli = process.platform === 'win32'
  ? '.\\node_modules\\.bin\\supabase.cmd'
  : './node_modules/.bin/supabase'

const statusResult = spawnSync(cli, ['status', '--output', 'json'], {
  cwd: projectRoot,
  encoding: 'utf8',
  windowsHide: true,
  shell: process.platform === 'win32',
})
if (statusResult.error || statusResult.status !== 0) {
  throw new Error('A stack Supabase local precisa estar ativa para iniciar B3.')
}

const status = JSON.parse(statusResult.stdout)
const target = new URL(status.API_URL)
if (!['http:', 'https:'].includes(target.protocol)
  || !['127.0.0.1', 'localhost', '::1'].includes(target.hostname)
  || target.username || target.password || target.pathname !== '/'
  || !status.PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
  throw new Error('B3 aceita apenas a URL de loopback e a chave publicável da CLI local.')
}

const childEnv = {
  ...process.env,
  VITE_APP_ENV: 'local',
  VITE_DATA_MODE: 'prototype-local',
  VITE_B3_LOCAL_AUTH: 'enabled',
  VITE_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
  B3_LOCAL_API_TARGET: target.origin,
}
for (const name of [
  'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_DB_PASSWORD',
  'SUPABASE_ACCESS_TOKEN', 'VITE_SUPABASE_SERVICE_ROLE_KEY',
]) delete childEnv[name]

const child = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort',
], { cwd: projectRoot, env: childEnv, stdio: 'inherit', windowsHide: true })

child.on('error', () => {
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
