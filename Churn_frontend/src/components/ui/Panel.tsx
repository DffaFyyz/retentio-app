import { cn } from '@/lib/utils'

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title?: string
  eyebrow?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('border border-ink-900/10 bg-bone-50', className)}>
      {(title || eyebrow || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-ink-900/10 px-4 py-4 sm:px-5">
          <div>
            {eyebrow && (
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/45">
                {eyebrow}
              </div>
            )}
            {title && <h2 className="font-display text-xl text-ink-900">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
  action?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/55">
          {eyebrow}
        </span>
        <h1 className="mt-2 font-display text-4xl leading-none text-ink-900 sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-900/60">{description}</p>}
      </div>
      {action}
    </header>
  )
}
