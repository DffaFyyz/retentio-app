import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

export function EmptyState({
  title = 'No data yet',
  message = 'Connect the backend to populate this view.',
  icon,
  action,
  className,
}: {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-5 py-14 text-center', className)}>
      <div className="mb-5 flex h-12 w-12 items-center justify-center bg-ink-900/5 text-ink-900/40">
        {icon ?? <Inbox className="h-5 w-5" strokeWidth={1.5} />}
      </div>
      <h3 className="font-display text-xl text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-900/55">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <RefreshCw className="mb-4 h-5 w-5 animate-spin text-ink-900/40" strokeWidth={1.5} />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-900/50">
        {message}
      </span>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center bg-rust-500/10 text-rust-500">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl text-ink-900">Could not load data</h3>
      <p className="mt-1.5 max-w-md font-mono text-sm text-ink-900/60">{error.message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-6" variant="primary">
          Try again
        </Button>
      )}
    </div>
  )
}
