import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLES = {
  success: 'border-success-200 bg-surface text-foreground',
  error: 'border-danger-200 bg-surface text-foreground',
  info: 'border-info-200 bg-surface text-foreground',
}

const ICON_STYLES = {
  success: 'bg-success-100 text-success-600',
  error: 'bg-danger-100 text-danger-600',
  info: 'bg-info-100 text-info-600',
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (type, message, duration = 4000) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, type, message }])
      const timer = setTimeout(() => remove(id), duration)
      timers.current.set(id, timer)
      return id
    },
    [remove],
  )

  const toast = useMemo(
    () => ({
      success: (msg, duration) => push('success', msg, duration),
      error: (msg, duration) => push('error', msg, duration),
      info: (msg, duration) => push('info', msg, duration),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-popover animate-slide-up ${STYLES[t.type]}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_STYLES[t.type]}`}>
              {ICONS[t.type]}
            </span>
            <p className="flex-1 pt-1 text-sm text-foreground">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
