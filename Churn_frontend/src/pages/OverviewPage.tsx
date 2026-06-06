import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RiskBadge } from '@/components/RiskBadge'
import { EmptyState, ErrorState, LoadingState } from '@/components/StatusStates'
import { Button } from '@/components/ui/Button'
import { PageHeader, Panel } from '@/components/ui/Panel'
import { api, emptyOverview } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { formatCompactCurrency, formatCurrency, formatPercent, initials } from '@/lib/utils'

export function OverviewPage() {
  const navigate = useNavigate()
  const overviewQ = useApi(() => api.getOverview(), [])
  const historyQ = useApi(() => api.getPredictionHistory(), [])
  const distQ = useApi(() => api.getRiskDistribution(), [])
  const customersQ = useApi(() => api.listCustomers({ limit: 100 }), [])

  const overview = overviewQ.data ?? emptyOverview
  const history = historyQ.data ?? []
  const dist = distQ.data ?? []
  const customers = customersQ.data?.data ?? []
  const topAtRisk = [...customers].sort((a, b) => b.churnProbability - a.churnProbability).slice(0, 6)
  const churnRate = overview.total > 0 ? overview.atRisk / overview.total : 0

  return (
    <div className="space-y-6 animate-rise sm:space-y-8">
      <PageHeader
        eyebrow="Dashboard · Today"
        title={<>Churn<span className="italic font-light">Ai</span></>}
        description="A real-time view of churn risk across your customer base, scored by the Flask XGBoost model."
        action={
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss-500" />
            Model threshold · 0.59
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-px bg-ink-900/10 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total customers" value={overview.total.toLocaleString()} hint="Active subscriber records" />
        <Metric label="Predicted to churn" value={overview.atRisk.toLocaleString()} accent="ember" hint={overview.total ? `${formatPercent(churnRate)} of customer base` : '-'} />
        <Metric label="Critical risk" value={overview.critical.toLocaleString()} accent="rust" hint="Probability >= 75%" />
        <Metric label="Revenue at risk" value={formatCompactCurrency(overview.revenueAtRisk)} unit="/yr" hint="Annualized MRR from flagged customers" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Prediction volume" eyebrow="Last activity" className="xl:col-span-2">
          <ChartFrame>
            {historyQ.loading ? (
              <LoadingState message="Loading history..." />
            ) : historyQ.error ? (
              <ErrorState error={historyQ.error} onRetry={historyQ.refetch} />
            ) : history.length === 0 ? (
              <EmptyState title="No prediction history" message="Predictions appear here once the ML service logs requests." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradInk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a0a0a" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradEmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#0a0a0a" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#0a0a0a', strokeOpacity: 0.2 }} />
                  <Area type="monotone" dataKey="predictions" stroke="#0a0a0a" strokeWidth={1.5} fill="url(#gradInk)" />
                  <Area type="monotone" dataKey="flagged" stroke="#ff6b35" strokeWidth={1.5} fill="url(#gradEmber)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>
        </Panel>

        <Panel title="Risk distribution" eyebrow="Probability buckets">
          <ChartFrame>
            {distQ.loading ? (
              <LoadingState message="Loading distribution..." />
            ) : distQ.error ? (
              <ErrorState error={distQ.error} onRetry={distQ.refetch} />
            ) : dist.length === 0 ? (
              <EmptyState title="No predictions" message="Distribution appears once customers are scored." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#0a0a0a" strokeOpacity={0.06} vertical={false} />
                  <XAxis dataKey="range" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#0a0a0a', fillOpacity: 0.04 }} />
                  <Bar dataKey="count">
                    {dist.map((bucket) => (
                      <Cell key={bucket.range} fill={bucket.lower >= 0.8 ? '#a8442a' : bucket.lower >= 0.6 ? '#ff6b35' : '#5d8043'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartFrame>
        </Panel>
      </section>

      <Panel
        title="Highest-risk customers"
        eyebrow="Needs attention first"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
      >
        {customersQ.loading ? (
          <LoadingState message="Loading customers..." />
        ) : customersQ.error ? (
          <ErrorState error={customersQ.error} onRetry={customersQ.refetch} />
        ) : topAtRisk.length === 0 ? (
          <EmptyState icon={<Users className="h-5 w-5" />} title="No customers loaded" message="Highest-risk accounts surface here once customer records exist." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {topAtRisk.map((customer) => (
              <button
                key={customer.customerID}
                onClick={() => navigate('/customers')}
                className="grid w-full grid-cols-[auto_1fr] gap-3 px-4 py-4 text-left transition-colors hover:bg-ink-900/[0.025] sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:px-5"
              >
                <div className="flex h-9 w-9 items-center justify-center bg-bone-200 font-mono text-[10px] text-ink-900">
                  {initials(customer.displayName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink-900">{customer.displayName}</div>
                  <div className="mt-0.5 truncate text-xs text-ink-900/55">{customer.riskFactors[0]?.feature ?? '-'} · {customer.Contract}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="font-mono text-xs text-ink-900/55">monthly</div>
                  <div className="font-mono text-sm text-ink-900 tabular">{formatCurrency(customer.MonthlyCharges)}</div>
                </div>
                <RiskBadge customer={customer} />
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

function Metric({
  label,
  value,
  unit,
  accent = 'ink',
  hint,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  accent?: 'ink' | 'ember' | 'rust'
  hint?: string
}) {
  const accentClass = accent === 'ember' ? 'text-ember-600' : accent === 'rust' ? 'text-rust-500' : 'text-ink-900'
  return (
    <div className="bg-bone-50 p-5">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/60">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`font-display text-4xl leading-none tabular ${accentClass}`}>{value}</span>
        {unit && <span className="font-mono text-sm text-ink-900/60">{unit}</span>}
      </div>
      {hint && <div className="mt-4 text-xs leading-snug text-ink-900/55">{hint}</div>}
    </div>
  )
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <div className="h-72 px-2 py-5 sm:px-5">{children}</div>
}

const axisTick = { fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b6960' }
const tooltipStyle = {
  background: '#0a0a0a',
  border: 'none',
  borderRadius: 0,
  fontSize: 11,
  fontFamily: 'JetBrains Mono',
  color: '#fafaf7',
}
