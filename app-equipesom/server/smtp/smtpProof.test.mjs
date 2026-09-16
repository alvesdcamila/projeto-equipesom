import assert from 'node:assert/strict'
import test from 'node:test'
import { composeOfflineSmtpProbe } from './offlineProbe.mjs'
import {
  HOSTOPIA_SMTP_SETTINGS,
  isSmtpVerificationAuthorized,
  loadHostopiaSmtpConfig,
  SMTP_PASSWORD_PLACEHOLDER,
  SMTP_VERIFY_CONFIRMATION,
} from './smtpConfig.mjs'

const fictitiousServerEnvironment = Object.freeze({
  SMTP_HOST: 'mail.consolegroup.com.br',
  SMTP_PORT: '465',
  SMTP_SECURE: 'true',
  SMTP_USER: 'propostas@consolegroup.com.br',
  SMTP_PASSWORD: 'segredo-ficticio-exclusivo-do-teste',
  SMTP_FROM: 'propostas@consolegroup.com.br',
})

test('mantém a configuração confirmada no limite server-side', () => {
  const configuration = loadHostopiaSmtpConfig(fictitiousServerEnvironment)

  assert.equal(configuration.host, HOSTOPIA_SMTP_SETTINGS.host)
  assert.equal(configuration.port, 465)
  assert.equal(configuration.secure, true)
  assert.equal(configuration.auth.user, HOSTOPIA_SMTP_SETTINGS.user)
  assert.equal(configuration.from, HOSTOPIA_SMTP_SETTINGS.from)
})

test('rejeita segredo ausente, fictício do exemplo ou prefixado com VITE_', () => {
  assert.throws(() => loadHostopiaSmtpConfig({}), /Credencial SMTP ausente/)
  assert.throws(
    () => loadHostopiaSmtpConfig({ SMTP_PASSWORD: SMTP_PASSWORD_PLACEHOLDER }),
    /Credencial SMTP ausente/,
  )
  assert.throws(
    () => loadHostopiaSmtpConfig({
      ...fictitiousServerEnvironment,
      VITE_SMTP_PASSWORD: 'nao-pode-existir',
    }),
    /não podem usar o prefixo VITE_/,
  )
})

test('rejeita mudança silenciosa dos parâmetros autorizados', () => {
  assert.throws(
    () => loadHostopiaSmtpConfig({ ...fictitiousServerEnvironment, SMTP_PORT: '1025' }),
    /SMTP_PORT diverge/,
  )
  assert.throws(
    () => loadHostopiaSmtpConfig({ ...fictitiousServerEnvironment, SMTP_SECURE: 'false' }),
    /SMTP_SECURE diverge/,
  )
})

test('a verificação remota exige confirmação explícita', () => {
  assert.equal(isSmtpVerificationAuthorized({}), false)
  assert.equal(isSmtpVerificationAuthorized({ SMTP_VERIFY_CONNECTION: 'NAO_EXECUTAR' }), false)
  assert.equal(isSmtpVerificationAuthorized({
    SMTP_VERIFY_CONNECTION: SMTP_VERIFY_CONFIRMATION,
  }), true)
})

test('compõe somente uma mensagem fictícia em memória', async () => {
  const result = await composeOfflineSmtpProbe()

  assert.deepEqual(result.envelope.to, ['laboratorio@example.invalid'])
  assert.match(result.message, /propostas@consolegroup\.com\.br/)
  assert.match(result.message, /laboratorio@example\.invalid/)
  assert.match(result.message, /X-EQUIPESOM-Proof: offline-only/i)
  assert.match(result.message, /Nenhuma proposta, cliente, PDF ou dado do localStorage foi utilizado\./)
  assert.doesNotMatch(result.message, /segredo-ficticio-exclusivo-do-teste/)
  assert.doesNotMatch(result.message, new RegExp(SMTP_PASSWORD_PLACEHOLDER))
})
