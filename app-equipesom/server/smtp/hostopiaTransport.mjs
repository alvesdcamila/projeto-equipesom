import nodemailer from 'nodemailer'
import { loadHostopiaSmtpConfig } from './smtpConfig.mjs'

export function createHostopiaSmtpTransport(environment = process.env) {
  const configuration = loadHostopiaSmtpConfig(environment)
  const transport = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    auth: configuration.auth,
    logger: false,
    debug: false,
  })

  return { transport, from: configuration.from }
}
