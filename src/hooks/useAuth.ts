import { useCallback, useEffect, useState } from 'react'
import type { AuthSession } from '../types'
import {
  authenticateUser,
  clearSession,
  readSession,
  registerUser,
  writeSession,
} from '../utils/auth'

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setSession(readSession())
    setReady(true)
  }, [])

  const login = useCallback(
    async (username: string, password: string, rememberMe: boolean) => {
      const result = await authenticateUser(username, password)
      if (!result.ok) return result

      const next: AuthSession = {
        userId: result.user.id,
        username: result.user.username,
      }
      writeSession(next, rememberMe)
      setSession(next)
      return { ok: true as const }
    },
    [],
  )

  const register = useCallback(async (username: string, password: string) => {
    const result = await registerUser(username, password)
    if (!result.ok) return result

    const next: AuthSession = {
      userId: result.user.id,
      username: result.user.username,
    }
    writeSession(next, true)
    setSession(next)
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  return {
    user: session,
    ready,
    login,
    register,
    logout,
  }
}
