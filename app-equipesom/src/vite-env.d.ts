/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'local' | 'homologation' | 'production'
  readonly VITE_DATA_MODE?: 'prototype-local' | 'isolated-empty'
  readonly VITE_PUBLIC_APP_ORIGIN?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_B3_LOCAL_AUTH?: 'enabled'
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string
  readonly VITE_SUPABASE_DB_URL?: string
  readonly VITE_SUPABASE_DB_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
