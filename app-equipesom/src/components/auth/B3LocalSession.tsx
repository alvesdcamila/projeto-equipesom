import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { B3AccessError, signInToB3, type B3Session } from '../../services/b3LocalBackend'

interface B3SessionContextValue {
  session: B3Session | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const B3SessionContext = createContext<B3SessionContextValue | null>(null)

export function B3LocalSessionProvider({ children }: { children: ReactNode }) {
  // B3 não usa localStorage, sessionStorage ou cookies para persistir JWT.
  const [session, setSession] = useState<B3Session | null>(null)

  useEffect(() => {
    if (!session) return
    const remaining = session.expiresAt - Date.now()
    const timer = window.setTimeout(() => setSession(null), Math.max(0, remaining))
    return () => window.clearTimeout(timer)
  }, [session])

  const value = useMemo<B3SessionContextValue>(() => ({
    session,
    async signIn(email, password) {
      if (session) throw new B3AccessError('Encerre a sessão atual antes de entrar novamente.')
      setSession(await signInToB3(email, password))
    },
    signOut() { setSession(null) },
  }), [session])

  return <B3SessionContext.Provider value={value}>{children}</B3SessionContext.Provider>
}

// O provider e o hook formam uma única fronteira de sessão exclusiva da prova B3.
// eslint-disable-next-line react-refresh/only-export-components
export function useB3LocalSession() {
  const context = useContext(B3SessionContext)
  if (!context) throw new Error('B3LocalSessionProvider não encontrado.')
  return context
}
