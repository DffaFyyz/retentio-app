import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 border transition-colors',
        'font-mono uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-bone-50',
        size === 'sm' && 'h-9 px-3 text-[11px]',
        size === 'md' && 'h-11 px-4 text-xs',
        size === 'icon' && 'h-10 w-10 text-xs',
        variant === 'primary' && 'border-ink-900 bg-ink-900 text-bone-50 hover:bg-ember-600 hover:border-ember-600',
        variant === 'secondary' && 'border-ink-900/15 bg-bone-50 text-ink-900 hover:bg-ink-900 hover:text-bone-50',
        variant === 'ghost' && 'border-transparent bg-transparent text-ink-900/65 hover:text-ink-900 hover:bg-ink-900/5',
        variant === 'danger' && 'border-rust-500/35 bg-rust-500/10 text-rust-600 hover:bg-rust-500 hover:text-bone-50',
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
