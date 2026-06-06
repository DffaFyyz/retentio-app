import type { Customer } from '@/types'
import { cn, formatPercent, riskTierFor, tierColor, tierLabel } from '@/lib/utils'

export function RiskBadge({
  customer,
  probability,
  riskLevel,
  size = 'sm',
  showLabel = true,
  className,
}: {
  customer?: Pick<Customer, 'churnProbability' | 'riskLevel'>
  probability?: number
  riskLevel?: 'LOW' | 'HIGH' | null
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}) {
  const tier = riskTierFor({
    churnProbability: customer?.churnProbability ?? probability ?? 0,
    riskLevel: customer?.riskLevel ?? riskLevel ?? null,
  })
  const colors = tierColor[tier]
  const value = customer?.churnProbability ?? probability ?? 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono ring-1',
        colors.fg,
        colors.bg,
        colors.ring,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', colors.dot)} aria-hidden />
      <span className="tabular">{formatPercent(value, 0)}</span>
      {showLabel && (
        <span className="font-sans text-[10px] uppercase tracking-wider opacity-80">
          {tierLabel[tier]}
        </span>
      )}
    </span>
  )
}
