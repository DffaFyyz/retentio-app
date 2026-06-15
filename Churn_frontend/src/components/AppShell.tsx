import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Wordmark } from './Wordmark'
import { Button } from './ui/Button'
import { useAuth } from '@/context/AuthContext'
import { cn, initials } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/interventions', label: 'Cases', icon: BriefcaseBusiness },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen lg:flex">
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink-900/10 bg-bone-100/95 px-4 backdrop-blur lg:hidden">
        <Wordmark />
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sidebar className="hidden lg:flex" />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-900/30"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar
            className="absolute inset-y-0 left-0 flex w-[min(19rem,86vw)] shadow-lift"
            onNavigate={() => setMobileOpen(false)}
            closeButton={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            }
          />
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}

function Sidebar({
  className,
  onNavigate,
  closeButton,
}: {
  className?: string
  onNavigate?: () => void
  closeButton?: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className={cn('w-60 shrink-0 flex-col border-r border-ink-900/10 bg-bone-100', className)}>
      <div className="border-b border-ink-900/10 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Wordmark />
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/45">
                Retention Intelligence
              </span>
              <span className="bg-ember-500/10 px-1.5 py-px font-mono text-[10px] text-ember-600">
                v1
              </span>
            </div>
          </div>
          {closeButton}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-bone-50 text-ink-900'
                  : 'text-ink-900/65 hover:bg-bone-50/70 hover:text-ink-900',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-ember-500"
                  />
                )}
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-900/10 px-3 py-4">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center bg-ink-900 font-mono text-[10px] text-bone-50">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-ink-900">{user.name}</div>
              <div className="truncate font-mono text-[10px] text-ink-900/55">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="p-1 text-ink-900/50 transition-colors hover:text-rust-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
