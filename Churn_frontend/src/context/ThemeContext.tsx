import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'retentio-theme'
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme, animate: boolean) {
  const root = document.documentElement
  if (animate) {
    root.classList.add('theme-transition')
    window.setTimeout(() => root.classList.remove('theme-transition'), 300)
  }
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? systemTheme())

  useEffect(() => {
    applyTheme(theme, false)
  }, [theme])

  // Follow the OS setting until the user picks a theme explicitly.
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return
    const onChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme()) return
      setThemeState(event.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the choice still applies for this session.
    }
    applyTheme(next, true)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

/** Concrete colours for Recharts, which needs real values for SVG attributes. */
export function useChartColors() {
  const { theme } = useTheme()
  return theme === 'dark'
    ? {
        ink: '#f0eee6',
        grid: '#f0eee6',
        axis: '#969388',
        ember: '#ff7442',
        mossLight: '#96be73',
        moss: '#78a258',
        rust: '#dc6c4e',
      }
    : {
        ink: '#0a0a0a',
        grid: '#0a0a0a',
        axis: '#6b6960',
        ember: '#ff6b35',
        mossLight: '#7ba05b',
        moss: '#5d8043',
        rust: '#a8442a',
      }
}
