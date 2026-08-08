import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api, { getErrorMessage } from '../services/api'

const TOKEN_KEY = 'gym_owner_token'
const USER_KEY = 'gym_owner_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const persist = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const res = await api.post('/login', { email, password })
      const { token, data } = res.data
      if (!token) throw new Error('No token returned')
      persist(token, data)
      return data
    },
    [persist],
  )

  const register = useCallback(async (payload) => {
    const res = await api.post('/register', payload)
    return res.data.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const res = await api.get('/profile')
    setUser(res.data.data)
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.data))
    return res.data.data
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      api
        .get('/profile')
        .then((res) => {
          setUser(res.data.data)
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.data))
        })
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [logout])

  const value = { user, loading, login, register, logout, refreshProfile, getErrorMessage }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
