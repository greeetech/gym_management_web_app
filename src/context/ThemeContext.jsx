import { useCallback, useEffect, useMemo, useState } from 'react'
import { APPEARANCE_STORAGE_KEY } from '../lib/utils'
import { THEME_IDS } from '../lib/theme-presets'
import { ThemeContext } from './theme-context'

const DEFAULT_STATE = { mode: 'system', theme: 'indigo' }

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
    return { mode, theme }
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
  root.setAttribute('data-theme', state.theme)
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

  const persist = useCallback((next) => {
    setState(next)
    applyAppearance(next)
    setResolvedMode(next.mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : next.mode)
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      resolvedMode,
      setMode: (mode) => persist({ ...state, mode }),
      setTheme: (theme) => persist({ ...state, theme }),
    }),
    [state, resolvedMode, persist],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
