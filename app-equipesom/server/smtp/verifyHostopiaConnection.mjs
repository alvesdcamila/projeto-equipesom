import { createHostopiaSmtpTransport } from './hostopiaTransport.mjs'
import { isSmtpVerificationAuthorized, SMTP_VERIFY_CONFIRMATION } from './smtpConfig.mjs'

if (!isSmtpVerificationAuthorized()) {
  console.error(
    `Verificação não executada. Defina SMTP_VERIFY_CONNECTION=${SMTP_VERIFY_CONFIRMATION} somente quando houver autorização explícita.`,
  )
  process.exitCode = 2
} else {
  const { transport } = createHostopiaSmtpTransport()

  try {
    await transport.verify()
    console.log('Conexão SMTP autenticada com sucesso, sem envio de mensagem.')
  } catch (error) {
    const errorCode = typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : 'SMTP_VERIFY_FAILED'
    console.error(`A verificação SMTP falhou (${errorCode}). Nenhuma mensagem foi enviada.`)
    process.exitCode = 1
  } finally {
    transport.close()
  }
}
