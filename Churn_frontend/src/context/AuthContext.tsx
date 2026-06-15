import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const API_URL = import.meta.env.VITE_API_URL ?? '/api'

interface BetterAuthUser {
  id: string
  name: string
  email: string
  role?: 'CS_AGENT' | 'MANAGER'
}

interface BetterAuthSessionResponse {
  user: BetterAuthUser
}

interface BetterAuthAuthResponse {
  user: BetterAuthUser
}

function toAppUser(user: BetterAuthUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'MANAGER' ? 'Retentio Manager' : 'CS Agent',
  }
}

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}/auth${path}`, {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.message ?? `Auth request failed with ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    authRequest<BetterAuthSessionResponse | null>('/get-session')
      .then((session) => {
        if (!cancelled) setUser(session?.user ? toAppUser(session.user) : null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      const result = await authRequest<BetterAuthAuthResponse>('/sign-in/email', {
        email,
        password,
        rememberMe: true,
      })
      setUser(toAppUser(result.user))
    } finally {
      setLoading(false)
    }
  }

  async function signup(name: string, email: string, password: string) {
    setLoading(true)
    try {
      const result = await authRequest<BetterAuthAuthResponse>('/sign-up/email', {
        name,
        email,
        password,
        rememberMe: true,
      })
      setUser(toAppUser(result.user))
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    try {
      await authRequest<{ success: boolean }>('/sign-out', {})
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
