import { PageHeader, Panel } from '@/components/ui/Panel'
import { useAuth } from '@/context/AuthContext'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl space-y-6 animate-rise sm:space-y-8">
      <PageHeader eyebrow="Workspace" title="Settings" />

      <Panel title="Profile" eyebrow="Account information">
        <DefinitionList
          rows={[
            ['Name', user?.name ?? '-'],
            ['Email', user?.email ?? '-'],
            ['Role', user?.role ?? '-'],
            ['User ID', user?.id ?? '-'],
          ]}
        />
      </Panel>

      <Panel title="Model" eyebrow="Current pipeline configuration">
        <DefinitionList
          rows={[
            ['Algorithm', 'XGBoost Classifier'],
            ['ML API', 'Flask service'],
            ['Auth', 'Better Auth session cookies'],
            ['Dataset', 'Telco Customer Churn'],
            ['Risk threshold', '0.59'],
            ['Latency target', '< 2s per request'],
          ]}
        />
      </Panel>
    </div>
  )
}

function DefinitionList({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="space-y-1 p-5">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-baseline justify-between gap-6 border-b border-ink-900/5 py-3 last:border-0">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">{key}</dt>
          <dd className="text-right font-mono text-sm text-ink-900 tabular">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
