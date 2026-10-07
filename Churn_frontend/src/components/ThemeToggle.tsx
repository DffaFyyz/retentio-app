import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to night mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center gap-2 text-ink-900/60 transition-colors hover:text-ink-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900',
        showLabel ? 'w-full px-3 py-2 text-sm hover:bg-bone-50/70' : 'h-10 w-10 justify-center hover:bg-ink-900/5',
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
      {showLabel && <span>{isDark ? 'Light mode' : 'Night mode'}</span>}
    </button>
  )
}
