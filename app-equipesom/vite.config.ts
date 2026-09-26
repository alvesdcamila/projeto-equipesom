import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O tsconfig do arquivo de configuração é deliberadamente mínimo e não inclui
// tipos de Node/DOM; estas declarações descrevem somente as APIs usadas aqui.
declare const process: { env: Record<string, string | undefined> }
declare const URL: new (input: string) => {
  protocol: string
  hostname: string
  username: string
  password: string
  pathname: string
  origin: string
}

export default defineConfig(({ command }) => {
  const b3Enabled = process.env.VITE_B3_LOCAL_AUTH === 'enabled'
  let localApiTarget: string | undefined

  if (b3Enabled) {
    const target = new URL(process.env.B3_LOCAL_API_TARGET ?? '')
    if (command !== 'serve'
      || process.env.VITE_APP_ENV !== 'local'
      || !['http:', 'https:'].includes(target.protocol)
      || !['127.0.0.1', 'localhost', '::1'].includes(target.hostname)
      || target.username || target.password || target.pathname !== '/') {
      throw new Error('B3 só pode usar o proxy de desenvolvimento em loopback local.')
    }
    localApiTarget = target.origin
  }

  return {
    plugins: [react()],
    server: b3Enabled && localApiTarget ? {
      host: '127.0.0.1',
      proxy: {
        '/__b3_supabase': {
          target: localApiTarget,
          changeOrigin: true,
          // Certificado autoassinado da CLI: exceção somente para destino loopback.
          secure: false,
          rewrite: (path: string) => path.replace(/^\/__b3_supabase/, ''),
        },
      },
    } : undefined,
  }
})
