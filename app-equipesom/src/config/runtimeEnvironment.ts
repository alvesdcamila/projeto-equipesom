export type RuntimeStage = 'local' | 'homologation' | 'production'
export type RuntimeDataMode = 'prototype-local' | 'isolated-empty'

const knownStages: RuntimeStage[] = ['local', 'homologation', 'production']
const requestedStage = import.meta.env.VITE_APP_ENV?.trim().toLowerCase()

const knownDataModes: RuntimeDataMode[] = ['prototype-local', 'isolated-empty']
const requestedDataMode = import.meta.env.VITE_DATA_MODE?.trim().toLowerCase()

const clientForbiddenSecretNames = [
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SUPABASE_DB_URL',
  'VITE_SUPABASE_DB_PASSWORD',
] as const

function isLoopbackUrl(value: string | undefined) {
  if (!value) return false

  try {
    const hostname = new URL(value).hostname
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
  } catch {
    return false
  }
}

function resolveStage(): RuntimeStage {
  if (requestedStage && !knownStages.includes(requestedStage as RuntimeStage)) {
    throw new Error('VITE_APP_ENV possui um ambiente não reconhecido.')
  }

  if (knownStages.includes(requestedStage as RuntimeStage)) {
    return requestedStage as RuntimeStage
  }

  return import.meta.env.DEV ? 'local' : 'production'
}

const stage = resolveStage()

function resolveDataMode(): RuntimeDataMode {
  if (requestedDataMode && !knownDataModes.includes(requestedDataMode as RuntimeDataMode)) {
    throw new Error('VITE_DATA_MODE possui um modo de dados não reconhecido.')
  }

  const dataMode = requestedDataMode as RuntimeDataMode | undefined
  const resolvedDataMode = dataMode ?? (stage === 'local' ? 'prototype-local' : 'isolated-empty')

  // Contrato de ambientes de 15/09/2026: demonstrativos nunca podem ser liberados fora do local.
  if (stage !== 'local' && resolvedDataMode === 'prototype-local') {
    throw new Error('Dados demonstrativos são proibidos em homologação e produção.')
  }

  return resolvedDataMode
}

function assertNoClientSecrets() {
  for (const variableName of clientForbiddenSecretNames) {
    if (import.meta.env[variableName]?.trim()) {
      throw new Error(`${variableName} não pode ser exposta em um build do frontend.`)
    }
  }
}

function assertNoLocalEndpointOutsideLocal() {
  if (stage === 'local') return

  for (const variableName of ['VITE_PUBLIC_APP_ORIGIN', 'VITE_SUPABASE_URL'] as const) {
    if (isLoopbackUrl(import.meta.env[variableName]?.trim())) {
      throw new Error(`${variableName} não pode usar localhost em ${stage}.`)
    }
  }
}

const dataMode = resolveDataMode()
assertNoClientSecrets()
assertNoLocalEndpointOutsideLocal()

export const runtimeEnvironment = {
  stage,
  dataMode,
  isLocal: stage === 'local',
  allowsPrototypeData: stage === 'local' && dataMode === 'prototype-local',
  label: {
    local: 'Ambiente local',
    homologation: 'Ambiente de homologação',
    production: 'Ambiente de produção',
  }[stage],
} as const
