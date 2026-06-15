import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '@/components/StatusStates'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { PageHeader, Panel } from '@/components/ui/Panel'
import { api, type CaseListParams } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import type { CasePriority, CaseStatus, InterventionCase } from '@/types'
import { cn, prettyEnum } from '@/lib/utils'

const statuses: Array<CaseStatus | 'all'> = ['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const priorities: Array<CasePriority | 'all'> = ['all', 'LOW', 'MEDIUM', 'HIGH']
const scopes: Array<'mine' | 'unassigned' | 'all'> = ['all', 'unassigned', 'mine']

export function InterventionsPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'Retentio Manager'
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<CaseStatus | 'all'>('all')
  const [priority, setPriority] = useState<CasePriority | 'all'>('all')
  const [scope, setScope] = useState<'mine' | 'unassigned' | 'all'>(isManager ? 'all' : 'mine')

  const query = useMemo<CaseListParams>(
    () => ({
      page,
      limit: 10,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      scope: isManager ? scope : 'mine',
    }),
    [isManager, page, priority, scope, status],
  )

  const casesQ = useApi(() => api.listInterventionCases(query), [query])
  const analyticsQ = useApi(() => (isManager ? api.getInterventionAnalytics() : Promise.resolve(null)), [isManager])

  const cases = casesQ.data?.data ?? []
  const meta = casesQ.data?.meta ?? { page, limit: 10, totalRecords: 0, totalPages: 1, scope: isManager ? scope : 'mine' }

  return (
    <div className="space-y-6 animate-rise">
      <PageHeader
        eyebrow="Retention workflow"
        title="Intervention Cases"
        description="Track churn cases, outreach, and retention offers from prediction to resolution."
      />

      {isManager && analyticsQ.data && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Metric label="Open" value={analyticsQ.data.openCases} />
          <Metric label="In progress" value={analyticsQ.data.inProgressCases} />
          <Metric label="Resolved" value={analyticsQ.data.resolvedCases} />
          <Metric label="Unassigned" value={analyticsQ.data.unassignedCases} />
          <Metric label="Offer accept" value={`${Math.round(analyticsQ.data.offerAcceptanceRate * 100)}%`} />
        </section>
      )}

      <Panel>
        <div className="flex flex-col gap-3 border-b border-ink-900/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <FilterSelect
              label="Status"
              value={status}
              options={statuses}
              onChange={(value) => {
                setStatus(value as CaseStatus | 'all')
                setPage(1)
              }}
            />
            <FilterSelect
              label="Priority"
              value={priority}
              options={priorities}
              onChange={(value) => {
                setPriority(value as CasePriority | 'all')
                setPage(1)
              }}
            />
            {isManager && (
              <FilterSelect
                label="Scope"
                value={scope}
                options={scopes}
                onChange={(value) => {
                  setScope(value as typeof scope)
                  setPage(1)
                }}
              />
            )}
          </div>
          <span className="font-mono text-xs text-ink-900/55">Scope · {meta.scope}</span>
        </div>

        {casesQ.loading && !casesQ.data ? (
          <LoadingState message="Loading intervention cases..." />
        ) : casesQ.error ? (
          <ErrorState error={casesQ.error} onRetry={casesQ.refetch} />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            title="No cases found"
            message="Open a churn case from a high-risk customer to start retention work."
          />
        ) : (
          <CaseList cases={cases} />
        )}
      </Panel>

      {cases.length > 0 && (
        <div className="flex items-center justify-between border border-ink-900/10 bg-bone-50 px-4 py-3">
          <span className="font-mono text-xs text-ink-900/55">
            Page {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <div className="flex items-center gap-2">
            <Button size="icon" disabled={meta.page <= 1} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" disabled={meta.page >= meta.totalPages} onClick={() => setPage((current) => current + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-ink-900/10 bg-bone-50 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-900/50">{label}</div>
      <div className="mt-1 font-display text-3xl text-ink-900 tabular">{value}</div>
    </div>
  )
}

function CaseList({ cases }: { cases: InterventionCase[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-900/10">
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Assigned</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>{cases.map((item) => <CaseRow key={item.id} item={item} />)}</tbody>
        </table>
      </div>
      <div className="divide-y divide-ink-900/5 lg:hidden">
        {cases.map((item) => (
          <Link key={item.id} to={`/interventions/${item.id}`} className="block px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-ink-900">{item.customer?.displayName ?? item.customer?.fullName ?? item.customerID}</div>
                <div className="mt-0.5 font-mono text-[11px] text-ink-900/45">{item.customerID}</div>
              </div>
              <Badge tone={item.priority === 'HIGH' ? 'danger' : 'default'}>{item.priority}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Mini label="Status" value={prettyEnum(item.status)} />
              <Mini label="Assigned" value={item.assignedTo?.name ?? 'Unassigned'} />
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

function CaseRow({ item }: { item: InterventionCase }) {
  return (
    <tr className="border-b border-ink-900/5 transition-colors hover:bg-ink-900/[0.025]">
      <Td>
        <Link to={`/interventions/${item.id}`} className="block">
          <div className="text-sm text-ink-900 hover:text-ember-600">{item.customer?.displayName ?? item.customer?.fullName ?? item.customerID}</div>
          <div className="font-mono text-[11px] text-ink-900/45">{item.customerID}</div>
        </Link>
      </Td>
      <Td><Badge>{prettyEnum(item.status)}</Badge></Td>
      <Td><Badge tone={item.priority === 'HIGH' ? 'danger' : 'default'}>{item.priority}</Badge></Td>
      <Td>{item.assignedTo?.name ?? 'Unassigned'}</Td>
      <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
    </tr>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/55">{label}</span>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{prettyEnum(option)}</option>
        ))}
      </Select>
    </label>
  )
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'danger' }) {
  return (
    <span className={cn('inline-flex h-6 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]', tone === 'danger' ? 'bg-rust-500/10 text-rust-600' : 'bg-ink-900/5 text-ink-900/65')}>
      {children}
    </span>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/55">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-ink-900/80">{children}</td>
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-900/45">{label}</div>
      <div className="mt-0.5 text-sm text-ink-900/80">{value}</div>
    </div>
  )
}
