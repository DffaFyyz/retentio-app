import { type ClassValue, clsx } from 'clsx'
import type { Customer, RiskTier } from '@/types'

export const RISK_THRESHOLD = 0.59

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`
}

export function riskTierFor(customer: Pick<Customer, 'churnProbability' | 'riskLevel'>): RiskTier {
  if (customer.riskLevel === 'HIGH') return 'high'
  if (customer.riskLevel === 'LOW') return 'low'
  return customer.churnProbability >= RISK_THRESHOLD ? 'high' : 'low'
}

export const tierLabel: Record<RiskTier, string> = {
  high: 'High',
  low: 'Low',
}

export const tierColor: Record<RiskTier, { fg: string; bg: string; ring: string; dot: string }> = {
  high: {
    fg: 'text-rust-500',
    bg: 'bg-rust-500/10',
    ring: 'ring-rust-500/30',
    dot: 'bg-rust-500',
  },
  low: {
    fg: 'text-moss-600',
    bg: 'bg-moss-500/10',
    ring: 'ring-moss-500/30',
    dot: 'bg-moss-500',
  },
}

export function tenureLabel(months: number): string {
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem === 0 ? `${years}y` : `${years}y ${rem}mo`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function prettyEnum(value: string) {
  return value.replace(/_/g, ' ')
}

export function dateLabel(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export function dateTimeLabel(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}
