import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { APPEARANCE_STORAGE_KEY } from '../lib/utils'
import { THEME_IDS } from '../lib/theme-presets'
import { ThemeContext } from './theme-context'
import api from '../services/api'

const DEFAULT_STATE = {
  mode: 'system',
  theme: 'indigo',
  primaryColor: '',
  borderRadius: '0.5rem',
  fontFamily: 'Inter',
  gymName: '',
  gymLogo: '',
}

function readStoredState() {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    const mode =
      parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'system'
        ? parsed.mode
        : DEFAULT_STATE.mode
    const theme = THEME_IDS.has(parsed.theme) ? parsed.theme : DEFAULT_STATE.theme
    return {
      mode,
      theme,
      primaryColor: parsed.primaryColor || '',
      borderRadius: parsed.borderRadius || '0.5rem',
      fontFamily: parsed.fontFamily || 'Inter',
      gymName: parsed.gymName || '',
      gymLogo: parsed.gymLogo || '',
    }
  } catch {
    return DEFAULT_STATE
  }
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyAppearance(state) {
  const root = document.documentElement
  const resolved = state.mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : state.mode
  root.classList.toggle('dark', resolved === 'dark')
  root.setAttribute('data-theme', state.theme || 'indigo')

  if (state.borderRadius) {
    root.style.setProperty('--radius', state.borderRadius)
    root.style.setProperty('--app-radius', state.borderRadius)
  }

  if (state.fontFamily) {
    const fontVal = `"${state.fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    root.style.setProperty('--font-sans', fontVal)
    document.body.style.fontFamily = fontVal
  }

  if (state.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(state.primaryColor)) {
    root.style.setProperty('--gym-brand-600', state.primaryColor)
    root.style.setProperty('--gym-brand-500', state.primaryColor)
    root.style.setProperty('--gym-brand-gradient', `linear-gradient(135deg, ${state.primaryColor} 0%, ${state.primaryColor}dd 100%)`)
  } else if (!state.primaryColor) {
    root.style.removeProperty('--gym-brand-600')
    root.style.removeProperty('--gym-brand-500')
    root.style.removeProperty('--gym-brand-gradient')
  }

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    const v = getComputedStyle(root).getPropertyValue('--gym-brand-600').trim() || '#4f46e5'
    meta.setAttribute('content', v)
  }
}

export function ThemeProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = readStoredState()
    applyAppearance(stored)
    return stored
  })

  const [resolvedMode, setResolvedMode] = useState(
    state.mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : state.mode,
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (state.mode === 'system') {
        const next = systemPrefersDark() ? 'dark' : 'light'
        setResolvedMode(next)
        document.documentElement.classList.toggle('dark', next === 'dark')
      }
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [state.mode])

  // Sync with tenant's GymProfile setup on initial load
  useEffect(() => {
    const token = localStorage.getItem('gym_owner_token')
    if (!token) return

    api
      .get('/setup')
      .then((res) => {
        const profile = res.data?.data?.profile
        if (profile?.customization) {
          const cust = profile.customization
          const brandLogo = profile.branding?.logo?.url || ''
          const brandGymName = profile.business?.gymName || ''

          setState((prev) => {
            const merged = {
              ...prev,
              theme: cust.themePreset || prev.theme,
              mode: cust.mode || prev.mode,
              primaryColor: cust.primaryColor !== undefined ? cust.primaryColor : prev.primaryColor,
              borderRadius: cust.borderRadius || prev.borderRadius,
              fontFamily: cust.fontFamily || prev.fontFamily,
              gymName: cust.gymName || brandGymName || prev.gymName,
              gymLogo: cust.gymLogo || brandLogo || prev.gymLogo,
            }
            applyAppearance(merged)
            try {
              localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(merged))
            } catch {}
            return merged
          })
        }
      })
      .catch(() => {})
  }, [])

  const persist = useCallback((next) => {
    setState(next)
    applyAppearance(next)
    setResolvedMode(next.mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : next.mode)
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }, [])

  const updateCustomization = useCallback(
    async (patch, saveToBackend = true) => {
      const next = { ...state, ...patch }
      persist(next)

      if (saveToBackend) {
        try {
          await api.put('/setup/step/customization', {
            themePreset: next.theme,
            mode: next.mode,
            primaryColor: next.primaryColor,
            borderRadius: next.borderRadius,
            fontFamily: next.fontFamily,
            gymName: next.gymName,
            gymLogo: next.gymLogo,
          })
        } catch (err) {
          console.error('Failed to save customization to backend:', err)
          throw err
        }
      }
    },
    [state, persist],
  )

  const value = useMemo(
    () => ({
      ...state,
      customization: state,
      resolvedMode,
      setMode: (mode) => {
        const next = { ...state, mode }
        persist(next)
      },
      setTheme: (theme) => {
        const next = { ...state, theme }
        persist(next)
      },
      updateCustomization,
    }),
    [state, resolvedMode, persist, updateCustomization],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
