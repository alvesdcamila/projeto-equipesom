export const HOSTOPIA_SMTP_SETTINGS = Object.freeze({
  host: 'mail.consolegroup.com.br',
  port: 465,
  secure: true,
  user: 'propostas@consolegroup.com.br',
  from: 'propostas@consolegroup.com.br',
})

export const SMTP_PASSWORD_PLACEHOLDER = 'VALOR_FICTICIO_NAO_UTILIZAR'
export const SMTP_VERIFY_CONFIRMATION = 'CONFIRMAR_SEM_ENVIO'

const expectedEnvironmentValues = Object.freeze({
  SMTP_HOST: HOSTOPIA_SMTP_SETTINGS.host,
  SMTP_PORT: String(HOSTOPIA_SMTP_SETTINGS.port),
  SMTP_SECURE: String(HOSTOPIA_SMTP_SETTINGS.secure),
  SMTP_USER: HOSTOPIA_SMTP_SETTINGS.user,
  SMTP_FROM: HOSTOPIA_SMTP_SETTINGS.from,
})

function assertNoClientPrefixedMailSecrets(environment) {
  const forbiddenKey = Object.keys(environment).find((key) =>
    key.startsWith('VITE_') && /(SMTP|MAIL|PASSWORD|SECRET)/i.test(key))

  if (forbiddenKey) {
    throw new Error('Configuração SMTP inválida: segredos de e-mail não podem usar o prefixo VITE_.')
  }
}

function assertConfirmedConnectionSettings(environment) {
  for (const [key, expectedValue] of Object.entries(expectedEnvironmentValues)) {
    const configuredValue = environment[key]?.trim()
    if (configuredValue && configuredValue !== expectedValue) {
      throw new Error(`Configuração SMTP inválida: ${key} diverge da prova autorizada.`)
    }
  }
}

export function loadHostopiaSmtpConfig(environment = process.env) {
  assertNoClientPrefixedMailSecrets(environment)
  assertConfirmedConnectionSettings(environment)

  const password = environment.SMTP_PASSWORD?.trim()
  if (!password || password === SMTP_PASSWORD_PLACEHOLDER) {
    throw new Error('Credencial SMTP ausente: configure o segredo somente no ambiente server-side local.')
  }

  return {
    host: HOSTOPIA_SMTP_SETTINGS.host,
    port: HOSTOPIA_SMTP_SETTINGS.port,
    secure: HOSTOPIA_SMTP_SETTINGS.secure,
    auth: {
      user: HOSTOPIA_SMTP_SETTINGS.user,
      pass: password,
    },
    from: HOSTOPIA_SMTP_SETTINGS.from,
  }
}

export function isSmtpVerificationAuthorized(environment = process.env) {
  return environment.SMTP_VERIFY_CONNECTION === SMTP_VERIFY_CONFIRMATION
}
