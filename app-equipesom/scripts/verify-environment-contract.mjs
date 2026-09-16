import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const readProjectFile = (path) => readFileSync(`${projectRoot}/${path}`, 'utf8')

const contract = JSON.parse(readProjectFile('config/environment-contract.json'))
const runtime = readProjectFile('src/config/runtimeEnvironment.ts')
const boundary = readProjectFile('src/components/auth/PrototypeAccessBoundary.tsx')
const localExample = readProjectFile('.env.example')

assert.equal(contract.schemaVersion, 1)
assert.deepEqual(Object.keys(contract.environments), ['local', 'homologation', 'production'])
assert.equal(contract.environments.local.dataMode, 'prototype-local')
assert.equal(contract.environments.homologation.dataMode, 'isolated-empty')
assert.equal(contract.environments.production.dataMode, 'isolated-empty')

for (const variableName of contract.serverOnlySecretVariables) {
  assert.doesNotMatch(variableName, /^VITE_/, `${variableName} não pode ser pública`)
}

for (const variableName of contract.forbiddenClientVariables) {
  assert.match(variableName, /^VITE_/)
  assert.doesNotMatch(localExample, new RegExp(`^${variableName}=`, 'm'))
}

assert.match(runtime, /stage !== 'local' && resolvedDataMode === 'prototype-local'/)
assert.match(runtime, /Dados demonstrativos são proibidos/)
assert.match(runtime, /assertNoClientSecrets\(\)/)
assert.match(runtime, /assertNoLocalEndpointOutsideLocal\(\)/)
assert.match(boundary, /runtimeEnvironment\.allowsPrototypeData/)
assert.match(localExample, /^VITE_APP_ENV=local$/m)
assert.match(localExample, /^VITE_DATA_MODE=prototype-local$/m)
assert.doesNotMatch(localExample, /SERVICE_ROLE|DB_PASSWORD|ACCESS_TOKEN/)

console.log('Contrato de ambientes verificado: local, homologação e produção separados.')
console.log('Nenhum segredo server-side é aceito com prefixo VITE_.')
