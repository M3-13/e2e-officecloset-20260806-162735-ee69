import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'

export interface User {
  id: number
  email: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  deleteAccount: () => Promise<void>
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

function base64Decode(str: string): string {
  return atob(str)
}

function decodeToken(token: string): User | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(base64Decode(parts[1]))
    const email =
      typeof payload.email === 'string'
        ? payload.email
        : typeof payload.sub === 'string' && payload.sub.includes('@')
          ? payload.sub
          : ''
    const id =
      typeof payload.sub === 'number'
        ? payload.sub
        : typeof payload.sub === 'string' && /^\d+$/.test(payload.sub)
          ? parseInt(payload.sub, 10)
          : typeof payload.user_id === 'number'
            ? payload.user_id
            : typeof payload.id === 'number'
              ? payload.id
              : 0
    return email ? { id, email } : null
  } catch {
    return null
  }
}

export const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [user, setUser] = useState<User | null>(() =>
    token ? decodeToken(token) : null,
  )

  useEffect(() => {
    if (token) {
      const u = decodeToken(token)
      setUser(u)
      try {
        localStorage.setItem('token', token)
      } catch {
        // running in an environment without localStorage (e.g. SSR)
      }
    } else {
      setUser(null)
      try {
        localStorage.removeItem('token')
      } catch {
        // running in an environment without localStorage
      }
    }
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    setToken(data.access_token)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const data = await authApi.register(email, password)
    setToken(data.access_token)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
  }, [])

  const deleteAccount = useCallback(async () => {
    await authApi.deleteAccount()
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
