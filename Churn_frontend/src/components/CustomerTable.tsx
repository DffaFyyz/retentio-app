import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { CustomerWithName } from '@/lib/api'
import { RiskBadge } from './RiskBadge'
import { cn, formatCurrency, initials, tenureLabel } from '@/lib/utils'

type SortKey = 'name' | 'probability' | 'tenure' | 'monthly' | 'contract'
type SortDir = 'asc' | 'desc'

export function CustomerTable({
  customers,
  onSelect,
}: {
  customers: CustomerWithName[]
  onSelect: (customer: CustomerWithName) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('probability')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = [...customers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    switch (sortKey) {
      case 'name':
        return a.displayName.localeCompare(b.displayName) * dir
      case 'probability':
        return (a.churnProbability - b.churnProbability) * dir
      case 'tenure':
        return (a.tenure - b.tenure) * dir
      case 'monthly':
        return (a.MonthlyCharges - b.MonthlyCharges) * dir
      case 'contract':
        return a.Contract.localeCompare(b.Contract) * dir
    }
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'name' || key === 'contract' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="border border-ink-900/10 bg-bone-50">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-900/10">
              <Th onClick={() => toggleSort('name')} icon={<SortIcon active={sortKey === 'name'} dir={sortDir} />}>Customer</Th>
              <Th align="right" onClick={() => toggleSort('probability')} icon={<SortIcon active={sortKey === 'probability'} dir={sortDir} />}>Churn risk</Th>
              <Th onClick={() => toggleSort('contract')} icon={<SortIcon active={sortKey === 'contract'} dir={sortDir} />}>Contract</Th>
              <Th align="right" onClick={() => toggleSort('tenure')} icon={<SortIcon active={sortKey === 'tenure'} dir={sortDir} />}>Tenure</Th>
              <Th align="right" onClick={() => toggleSort('monthly')} icon={<SortIcon active={sortKey === 'monthly'} dir={sortDir} />}>Monthly</Th>
              <Th>Internet</Th>
              <Th>Top driver</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((customer) => (
              <tr
                key={customer.customerID}
                onClick={() => onSelect(customer)}
                className="group cursor-pointer border-b border-ink-900/5 transition-colors hover:bg-ink-900/[0.025]"
              >
                <Td>
                  <CustomerIdentity customer={customer} />
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end">
                    <RiskBadge customer={customer} showLabel={false} />
                  </div>
                </Td>
                <Td>{customer.Contract}</Td>
                <Td className="text-right font-mono tabular">{tenureLabel(customer.tenure)}</Td>
                <Td className="text-right font-mono tabular">{formatCurrency(customer.MonthlyCharges)}</Td>
                <Td>{customer.InternetService}</Td>
                <Td className="max-w-48 truncate text-xs text-ink-900/65">{customer.riskFactors[0]?.feature ?? '-'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-ink-900/5 lg:hidden">
        {sorted.map((customer) => (
          <button
            key={customer.customerID}
            type="button"
            onClick={() => onSelect(customer)}
            className="w-full p-4 text-left transition-colors hover:bg-ink-900/[0.025]"
          >
            <div className="flex items-start justify-between gap-3">
              <CustomerIdentity customer={customer} />
              <RiskBadge customer={customer} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Mini label="Contract" value={customer.Contract} />
              <Mini label="Tenure" value={tenureLabel(customer.tenure)} />
              <Mini label="Monthly" value={formatCurrency(customer.MonthlyCharges)} />
              <Mini label="Internet" value={customer.InternetService} />
            </div>
            <div className="mt-3 border-t border-ink-900/5 pt-3 text-xs text-ink-900/60">
              Top driver: {customer.riskFactors[0]?.feature ?? '-'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function CustomerIdentity({ customer }: { customer: CustomerWithName }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-bone-200 font-mono text-[10px] font-medium text-ink-900 transition-colors group-hover:bg-ink-900 group-hover:text-bone-50">
        {initials(customer.displayName)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm text-ink-900">{customer.displayName}</div>
        <div className="truncate font-mono text-[11px] text-ink-900/45">{customer.customerID}</div>
      </div>
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-30" />
  return dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
}

function Th({
  children,
  icon,
  onClick,
  align = 'left',
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        'px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/55',
        onClick && 'cursor-pointer hover:text-ink-900',
        align === 'right' && 'text-right',
      )}
    >
      <div className={cn('flex items-center gap-1.5', align === 'right' && 'justify-end')}>
        {align === 'right' && icon}
        <span>{children}</span>
        {align === 'left' && icon}
      </div>
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-sm text-ink-900/80', className)}>{children}</td>
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-900/45">{label}</div>
      <div className="mt-0.5 text-sm text-ink-900/80">{value}</div>
    </div>
  )
}
