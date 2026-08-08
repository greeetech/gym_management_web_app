import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const OwnerSubscriptionContext = createContext(null)

export function OwnerSubscriptionProvider({ children }) {
  const { user } = useAuth()
  const userId = user?._id || user?.id || null
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const reqId = useRef(0)

  const refresh = useCallback(async () => {
    if (!userId) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    const id = ++reqId.current
    setLoading(true)
    try {
      const res = await api.get('/payment/history', { params: { limit: 5 } })
      if (id === reqId.current) {
        setData(res.data.data)
        setError(null)
      }
    } catch (err) {
      if (id === reqId.current) {
        setError(err?.response?.data?.message || err?.message || 'Could not load subscription')
      }
    } finally {
      if (id === reqId.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const items = data?.items || []
  const active = items.find((s) => s.status === 'active') || null
  const latest = items[0] || null
  const current = active || latest

  return (
    <OwnerSubscriptionContext.Provider value={{ loading, error, refresh, items, active, current }}>
      {children}
    </OwnerSubscriptionContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useOwnerSubscription() {
  const ctx = useContext(OwnerSubscriptionContext)
  if (!ctx) throw new Error('useOwnerSubscription must be used within OwnerSubscriptionProvider')
  return ctx
}
