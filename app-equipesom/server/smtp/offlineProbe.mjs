import nodemailer from 'nodemailer'
import { HOSTOPIA_SMTP_SETTINGS } from './smtpConfig.mjs'

const OFFLINE_RECIPIENT = 'laboratorio@example.invalid'

export async function composeOfflineSmtpProbe() {
  // Stream transport apenas compõe a mensagem RFC 822 em memória; não abre conexão de rede.
  const transport = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'unix',
  })

  const result = await transport.sendMail({
    from: `EQUIPESOM | Console Group <${HOSTOPIA_SMTP_SETTINGS.from}>`,
    to: OFFLINE_RECIPIENT,
    subject: 'Prova técnica offline de composição SMTP',
    text: [
      'Mensagem inteiramente fictícia para validação local.',
      'Nenhuma proposta, cliente, PDF ou dado do localStorage foi utilizado.',
      'Este conteúdo não foi transmitido a um servidor SMTP.',
    ].join('\n'),
    headers: {
      'X-EQUIPESOM-Proof': 'offline-only',
    },
  })

  return {
    envelope: result.envelope,
    message: result.message.toString('utf8'),
  }
}
