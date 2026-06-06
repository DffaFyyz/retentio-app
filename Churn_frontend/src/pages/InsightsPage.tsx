import { BarChart3 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState, ErrorState, LoadingState } from '@/components/StatusStates'
import { PageHeader, Panel } from '@/components/ui/Panel'
import { api, type CustomerWithName } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { formatPercent } from '@/lib/utils'

function aggregateFeatureImportance(customers: CustomerWithName[]) {
  const map: Record<string, { total: number; count: number; direction: string }> = {}
  for (const customer of customers) {
    for (const factor of customer.riskFactors) {
      if (!map[factor.feature]) map[factor.feature] = { total: 0, count: 0, direction: factor.direction }
      map[factor.feature].total += factor.impact
      map[factor.feature].count += 1
    }
  }
  return Object.entries(map)
    .map(([feature, { total, count, direction }]) => ({
      feature,
      importance: total / count,
      mentions: count,
      direction,
    }))
    .sort((a, b) => b.importance - a.importance)
}

export function InsightsPage() {
  const customersQ = useApi(() => api.listCustomers({ limit: 100 }), [])
  const contractsQ = useApi(() => api.getContractAggregates(), [])
  const customers = customersQ.data?.data ?? []
  const contracts = contractsQ.data ?? []
  const features = aggregateFeatureImportance(customers)

  return (
    <div className="space-y-6 animate-rise sm:space-y-8">
      <PageHeader
        eyebrow="Model interpretability"
        title={<>Why customers <span className="italic font-light">leave</span></>}
        description="Feature importance scores from saved predictions and customer outcomes."
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Top churn drivers" eyebrow="Risk factors">
          <div className="p-5">
            {customersQ.loading ? (
              <LoadingState message="Loading features..." />
            ) : customersQ.error ? (
              <ErrorState error={customersQ.error} onRetry={customersQ.refetch} />
            ) : features.length === 0 ? (
              <EmptyState icon={<BarChart3 className="h-5 w-5" />} title="No feature data" message="Feature importance appears once predictions are available." />
            ) : (
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.feature}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm text-ink-900">{feature.feature}</span>
                      <span className="font-mono text-xs text-ink-900/70 tabular">{(feature.importance * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 bg-ink-900/5">
                      <div
                        className="h-full bg-gradient-to-r from-ember-500 to-ember-400"
                        style={{ width: `${Math.min(100, (feature.importance / features[0].importance) * 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-900/35">
                      {feature.mentions} mentions · {feature.direction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Churn rate by contract" eyebrow="Customer outcome">
          <div className="p-5">
            {contractsQ.loading ? (
              <LoadingState message="Loading aggregates..." />
            ) : contractsQ.error ? (
              <ErrorState error={contractsQ.error} onRetry={contractsQ.refetch} />
            ) : contracts.length === 0 ? (
              <EmptyState title="No contract data" message="Aggregates appear once customers are loaded." />
            ) : (
              <>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contracts.map((contract) => ({
                        ...contract,
                        rate: contract.total > 0 ? (contract.churned / contract.total) * 100 : 0,
                      }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#0a0a0a" strokeOpacity={0.06} vertical={false} />
                      <XAxis dataKey="contract" tick={axisTick} axisLine={false} tickLine={false} />
                      <YAxis unit="%" tick={axisTick} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Churn rate']} cursor={{ fill: '#0a0a0a', fillOpacity: 0.04 }} />
                      <Bar dataKey="rate">
                        {contracts.map((_, index) => (
                          <Cell key={index} fill={index === 0 ? '#ff6b35' : index === 1 ? '#7ba05b' : '#5d8043'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-ink-900/5 pt-4 sm:grid-cols-3">
                  {contracts.map((contract) => (
                    <div key={contract.contract}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/55">{contract.contract}</div>
                      <div className="mt-1 font-display text-2xl text-ink-900 tabular">{contract.total > 0 ? formatPercent(contract.churned / contract.total, 1) : '-'}</div>
                      <div className="font-mono text-[11px] text-ink-900/55">{contract.churned} of {contract.total}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Panel>
      </section>

      <section className="bg-ink-900 p-6 text-bone-50 sm:p-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-300/70">Model performance</span>
            <h2 className="mt-2 font-display text-3xl">XGBoost Classifier</h2>
          </div>
          <span className="font-mono text-xs text-bone-300/60">Live threshold: 0.59</span>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            ['F1-Score', '—'],
            ['Recall', 'target ≥ 80%'],
            ['Precision', '—'],
            ['Accuracy', '—'],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-bone-50/15 pt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/70">{label}</div>
              <div className="mt-2 font-display text-3xl tabular">{value === 'target ≥ 80%' ? '—' : value}</div>
              {value === 'target ≥ 80%' && <div className="mt-1 font-mono text-[11px] text-bone-300/60">{value}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
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
