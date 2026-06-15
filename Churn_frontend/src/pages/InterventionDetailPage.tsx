import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Clock3, FileText, Gift, PhoneCall, UserRound } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '@/components/StatusStates'
import { ModalPortal } from '@/components/ModalPortal'
import { Button } from '@/components/ui/Button'
import { Field, Select, TextArea } from '@/components/ui/Field'
import { Panel } from '@/components/ui/Panel'
import { api, type UpdateCaseInput } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import type { AgentUser, CasePriority, CaseResolutionOutcome, CaseStatus, InterventionCase, OfferStatus, RetentionOffer } from '@/types'
import { cn, dateLabel, dateTimeLabel, formatCurrency, formatPercent, prettyEnum, tenureLabel } from '@/lib/utils'

const activeStatusOptions: CaseStatus[] = ['OPEN', 'IN_PROGRESS']
const priorityOptions: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH']
const resolutionOutcomes: CaseResolutionOutcome[] = ['RETAINED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'CUSTOMER_UNREACHABLE', 'CHURN_CONFIRMED', 'OTHER']
const offerStatusOptions: OfferStatus[] = ['OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']

export function InterventionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isManager = user?.role === 'Retentio Manager'
  const [updating, setUpdating] = useState(false)
  const [resolveMode, setResolveMode] = useState<'RESOLVED' | 'CLOSED' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const caseQ = useApi(() => (id ? api.getInterventionCase(id) : Promise.reject(new Error('Missing case id'))), [id])
  const agentsQ = useApi(() => (isManager ? api.listAgents() : Promise.resolve({ msg: 'success' as const, data: [] as AgentUser[] })), [isManager])

  const interventionCase = caseQ.data
  const customer = interventionCase?.customer
  const customerName = customer?.displayName ?? customer?.fullName ?? interventionCase?.customerID ?? 'Customer'

  const timeline = useMemo(() => {
    if (!interventionCase) return []
    return [
      { id: `case-${interventionCase.id}`, at: interventionCase.createdAt, title: 'Case opened', detail: interventionCase.createdBy?.name ?? 'System' },
      ...(interventionCase.outreachLogs ?? []).map((log) => ({
        id: log.id,
        at: log.createdAt,
        title: `${prettyEnum(log.channel)} outreach`,
        detail: `${prettyEnum(log.outcome)}${log.notes ? ` · ${log.notes}` : ''}`,
      })),
      ...(interventionCase.retentionOffers ?? []).map((offer) => ({
        id: offer.id,
        at: offer.createdAt,
        title: `Offer created · ${offer.title}`,
        detail: `${prettyEnum(offer.offerType)} · ${prettyEnum(offer.status)}`,
      })),
      ...(interventionCase.resolvedAt ? [{ id: `resolved-${interventionCase.id}`, at: interventionCase.resolvedAt, title: 'Case resolved', detail: interventionCase.resolutionNote ?? 'No resolution note' }] : []),
      ...(interventionCase.closedAt ? [{ id: `closed-${interventionCase.id}`, at: interventionCase.closedAt, title: 'Case closed', detail: interventionCase.resolutionNote ?? 'No closing note' }] : []),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }, [interventionCase])

  async function updateCase(payload: UpdateCaseInput) {
    if (!id) return
    setUpdating(true)
    setError(null)
    try {
      await api.updateInterventionCase(id, payload)
      caseQ.refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update case')
    } finally {
      setUpdating(false)
    }
  }

  async function updateOfferStatus(offer: RetentionOffer, status: OfferStatus) {
    setUpdating(true)
    setError(null)
    try {
      await api.updateRetentionOfferStatus(offer.id, status)
      caseQ.refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer')
    } finally {
      setUpdating(false)
    }
  }

  if (caseQ.loading && !caseQ.data) {
    return <div className="border border-ink-900/10 bg-bone-50"><LoadingState message="Loading case detail..." /></div>
  }

  if (caseQ.error) {
    return <div className="border border-ink-900/10 bg-bone-50"><ErrorState error={caseQ.error} onRetry={caseQ.refetch} /></div>
  }

  if (!interventionCase) {
    return <EmptyState icon={<FileText className="h-5 w-5" />} title="Case not found" message="The selected intervention case is unavailable." />
  }

  return (
    <div className="space-y-6 animate-rise">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/interventions')}>
            <ArrowLeft className="h-4 w-4" />
            Cases
          </Button>
          <h1 className="mt-3 font-display text-4xl leading-none text-ink-900 sm:text-5xl">{customerName}</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-900/60">
            Case {interventionCase.id} · Customer {interventionCase.customerID}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone(interventionCase.status)}>{prettyEnum(interventionCase.status)}</Badge>
          <Badge tone={interventionCase.priority === 'HIGH' ? 'danger' : 'default'}>{interventionCase.priority} priority</Badge>
        </div>
      </header>

      {error && <div className="border-l-2 border-rust-500 pl-3 font-mono text-xs text-rust-500">{error}</div>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Churn snapshot" value={formatPercent(interventionCase.churnProbabilitySnapshot, 1)} />
        <Metric label="Risk level" value={interventionCase.riskLevelSnapshot ?? 'Unknown'} />
        <Metric label="Assigned" value={interventionCase.assignedTo?.name ?? 'Unassigned'} />
        <Metric label="Created" value={dateLabel(interventionCase.createdAt)} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Panel title="Case controls" action={<BadgeCheck className="h-4 w-4 text-ink-900/45" />}>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <SelectField
                label="Status"
                value={interventionCase.status}
                options={activeStatusOptions.includes(interventionCase.status) ? activeStatusOptions : [interventionCase.status]}
                disabled={updating || !activeStatusOptions.includes(interventionCase.status)}
                onChange={(value) => updateCase({ status: value as CaseStatus })}
              />
              <SelectField
                label="Priority"
                value={interventionCase.priority}
                options={priorityOptions}
                disabled={updating || !isManager}
                onChange={(value) => updateCase({ priority: value as CasePriority })}
              />
              {isManager && (
                <AssignmentSelect
                  value={interventionCase.assignedToId ?? ''}
                  agents={agentsQ.data?.data ?? []}
                  loading={agentsQ.loading}
                  disabled={updating}
                  onChange={(value) => updateCase({ assignedToId: value || null })}
                />
              )}
            </div>
            <div className="border-t border-ink-900/10 p-5">
              {interventionCase.resolutionOutcome && (
                <div className="mb-4 border border-ink-900/10 px-4 py-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/45">Resolution</div>
                  <div className="mt-1 text-sm text-ink-900">{prettyEnum(interventionCase.resolutionOutcome)}</div>
                  {interventionCase.resolutionNote && <p className="mt-2 text-sm text-ink-900/65">{interventionCase.resolutionNote}</p>}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="primary" disabled={updating} onClick={() => setResolveMode('RESOLVED')}>
                  Resolve case
                </Button>
                {isManager && (
                  <Button type="button" disabled={updating} onClick={() => setResolveMode('CLOSED')}>
                    Close case
                  </Button>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Recommended actions" action={<Gift className="h-4 w-4 text-ink-900/45" />}>
            <div className="space-y-3 p-5">
              {(interventionCase.recommendedActions ?? []).map((action) => (
                <div key={`${action.type}-${action.label}`} className="border border-ink-900/10 px-4 py-3">
                  <div className="text-sm font-medium text-ink-900">{action.label}</div>
                  <div className="mt-1 text-xs text-ink-900/55">{action.reason}</div>
                </div>
              ))}
              {(interventionCase.recommendedActions ?? []).length === 0 && <p className="text-sm text-ink-900/55">No recommended actions stored.</p>}
            </div>
          </Panel>

          <Panel title="Outreach logs" action={<PhoneCall className="h-4 w-4 text-ink-900/45" />}>
            <div className="space-y-3 p-5">
              {(interventionCase.outreachLogs ?? []).map((log) => (
                <div key={log.id} className="border border-ink-900/10 px-4 py-3">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="text-sm text-ink-900">{prettyEnum(log.channel)} · {prettyEnum(log.outcome)}</div>
                    <div className="font-mono text-xs text-ink-900/45">{dateTimeLabel(log.createdAt)}</div>
                  </div>
                  <div className="mt-1 text-xs text-ink-900/55">
                    {log.agent?.name ?? 'Unknown agent'}{log.nextFollowUpAt ? ` · Follow-up ${dateLabel(log.nextFollowUpAt)}` : ''}
                  </div>
                  {log.notes && <p className="mt-2 text-sm text-ink-900/70">{log.notes}</p>}
                </div>
              ))}
              {(interventionCase.outreachLogs ?? []).length === 0 && <p className="text-sm text-ink-900/55">No outreach logged yet.</p>}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer snapshot" action={<UserRound className="h-4 w-4 text-ink-900/45" />}>
            {customer ? (
              <div className="grid grid-cols-2 gap-4 p-5">
                <FieldValue label="Contract" value={customer.Contract} />
                <FieldValue label="Tenure" value={tenureLabel(customer.tenure)} />
                <FieldValue label="Monthly" value={formatCurrency(customer.MonthlyCharges)} />
                <FieldValue label="Internet" value={customer.InternetService} />
                <FieldValue label="Payment" value={customer.PaymentMethod} />
                <FieldValue label="Tech Support" value={customer.TechSupport} />
              </div>
            ) : (
              <p className="p-5 text-sm text-ink-900/55">Customer snapshot unavailable.</p>
            )}
          </Panel>

          <Panel title="Retention offers" action={<Gift className="h-4 w-4 text-ink-900/45" />}>
            <div className="space-y-3 p-5">
              {(interventionCase.retentionOffers ?? []).map((offer) => (
                <OfferCard key={offer.id} offer={offer} disabled={updating} onStatusChange={(status) => updateOfferStatus(offer, status)} />
              ))}
              {(interventionCase.retentionOffers ?? []).length === 0 && <p className="text-sm text-ink-900/55">No retention offers created yet.</p>}
            </div>
          </Panel>

          <Panel title="Timeline" action={<Clock3 className="h-4 w-4 text-ink-900/45" />}>
            <div className="space-y-3 p-5">
              {timeline.map((item) => (
                <div key={item.id} className="border-l-2 border-ink-900/10 pl-3">
                  <div className="text-sm text-ink-900">{item.title}</div>
                  <div className="mt-0.5 text-xs text-ink-900/55">{item.detail}</div>
                  <div className="mt-1 font-mono text-[10px] text-ink-900/40">{dateTimeLabel(item.at)}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <Link to="/interventions" className="font-mono text-xs uppercase tracking-wider text-ink-900/55 hover:text-ink-900">
        Back to intervention cases
      </Link>

      <ResolveCaseModal
        open={resolveMode !== null}
        mode={resolveMode ?? 'RESOLVED'}
        interventionCase={interventionCase}
        saving={updating}
        onClose={() => setResolveMode(null)}
        onSubmit={async (payload) => {
          await updateCase(payload)
          setResolveMode(null)
        }}
      />
    </div>
  )
}

function AssignmentSelect({
  value,
  agents,
  loading,
  disabled,
  onChange,
}: {
  value: string
  agents: AgentUser[]
  loading: boolean
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <SelectField
      label="Assigned agent"
      value={value}
      options={['', ...agents.map((agent) => agent.id)]}
      disabled={disabled || loading}
      onChange={onChange}
      display={(option) => {
        if (!option) return 'Unassigned'
        const agent = agents.find((item) => item.id === option)
        return agent ? `${agent.name} · ${agent.email}` : option
      }}
    />
  )
}

function SelectField({
  label,
  value,
  options,
  disabled,
  onChange,
  display,
}: {
  label: string
  value: string
  options: string[]
  disabled?: boolean
  onChange: (value: string) => void
  display?: (value: string) => string
}) {
  return (
    <Field label={label}>
      <Select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{display ? display(option) : prettyEnum(option)}</option>
        ))}
      </Select>
    </Field>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-ink-900/10 bg-bone-50 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-900/50">{label}</div>
      <div className="mt-1 truncate font-display text-2xl text-ink-900 tabular">{value}</div>
    </div>
  )
}

function OfferCard({
  offer,
  disabled,
  onStatusChange,
}: {
  offer: RetentionOffer
  disabled?: boolean
  onStatusChange: (status: OfferStatus) => void
}) {
  return (
    <div className="border border-ink-900/10 px-4 py-3">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink-900">{offer.title}</div>
          <div className="mt-1 text-xs text-ink-900/55">
            {prettyEnum(offer.offerType)}
            {offer.discountPercent ? ` · ${offer.discountPercent}% discount` : ''}
            {offer.discountAmount ? ` · ${formatCurrency(offer.discountAmount)}` : ''}
            {offer.durationMonths ? ` · ${offer.durationMonths} months` : ''}
          </div>
        </div>
        <Select
          value={offer.status}
          disabled={disabled}
          onChange={(event) => onStatusChange(event.target.value as OfferStatus)}
          className="h-8 w-auto text-xs"
        >
          {offerStatusOptions.map((status) => (
            <option key={status} value={status}>{prettyEnum(status)}</option>
          ))}
        </Select>
      </div>
      {offer.description && <p className="mt-2 text-sm text-ink-900/70">{offer.description}</p>}
    </div>
  )
}

function ResolveCaseModal({
  open,
  mode,
  interventionCase,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'RESOLVED' | 'CLOSED'
  interventionCase: Pick<InterventionCase, 'outreachLogs' | 'retentionOffers' | 'resolutionOutcome' | 'resolutionNote' | 'finalOutreachLogId' | 'finalOfferId'>
  saving?: boolean
  onClose: () => void
  onSubmit: (payload: UpdateCaseInput) => Promise<void>
}) {
  const [outcome, setOutcome] = useState<CaseResolutionOutcome>(interventionCase.resolutionOutcome ?? 'RETAINED')
  const [note, setNote] = useState(interventionCase.resolutionNote ?? '')
  const [finalOutreachLogId, setFinalOutreachLogId] = useState(interventionCase.finalOutreachLogId ?? '')
  const [finalOfferId, setFinalOfferId] = useState(interventionCase.finalOfferId ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setOutcome(interventionCase.resolutionOutcome ?? 'RETAINED')
    setNote(interventionCase.resolutionNote ?? '')
    setFinalOutreachLogId(interventionCase.finalOutreachLogId ?? '')
    setFinalOfferId(interventionCase.finalOfferId ?? '')
    setLocalError(null)
  }, [interventionCase, open])

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) {
      setLocalError('Resolution note is required.')
      return
    }
    setLocalError(null)
    await onSubmit({
      status: mode,
      resolutionOutcome: outcome,
      resolutionNote: note.trim(),
      finalOutreachLogId: finalOutreachLogId || null,
      finalOfferId: finalOfferId || null,
    })
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/50 p-4 sm:p-6">
      <form onSubmit={handleSubmit} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl animate-rise flex-col overflow-hidden border border-ink-900/15 bg-bone-50 shadow-lift">
        <div className="flex items-start justify-between gap-4 border-b border-ink-900/10 px-6 py-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">{mode === 'RESOLVED' ? 'Resolve case' : 'Close case'}</span>
            <h3 className="mt-1 font-display text-2xl text-ink-900">Confirm final outcome</h3>
          </div>
          <button type="button" onClick={onClose} className="text-ink-900/45 hover:text-ink-900">Close</button>
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <SelectField label="Final outcome" value={outcome} options={resolutionOutcomes} disabled={saving} onChange={(value) => setOutcome(value as CaseResolutionOutcome)} />
          <Field label="Resolution note">
            <TextArea required rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Summarize what happened and why this case can be resolved." />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Final outreach"
              value={finalOutreachLogId}
              options={['', ...(interventionCase.outreachLogs ?? []).map((log) => log.id)]}
              disabled={saving}
              onChange={setFinalOutreachLogId}
              display={(value) => {
                if (!value) return 'None selected'
                const log = interventionCase.outreachLogs?.find((item) => item.id === value)
                return log ? `${prettyEnum(log.channel)} · ${prettyEnum(log.outcome)}` : value
              }}
            />
            <SelectField
              label="Final offer"
              value={finalOfferId}
              options={['', ...(interventionCase.retentionOffers ?? []).map((offer) => offer.id)]}
              disabled={saving}
              onChange={setFinalOfferId}
              display={(value) => {
                if (!value) return 'None selected'
                const offer = interventionCase.retentionOffers?.find((item) => item.id === value)
                return offer ? `${offer.title} · ${prettyEnum(offer.status)}` : value
              }}
            />
          </div>
          {localError && <div className="font-mono text-xs text-rust-500">{localError}</div>}
        </div>
        <div className="grid grid-cols-2 border-t border-ink-900/10">
          <Button type="button" variant="ghost" className="h-12" disabled={saving} onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="h-12 border-y-0 border-r-0" disabled={saving}>{saving ? 'Saving...' : mode === 'RESOLVED' ? 'Resolve case' : 'Close case'}</Button>
        </div>
      </form>
      </div>
    </ModalPortal>
  )
}

function FieldValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/45">{label}</div>
      <div className="mt-1 text-sm text-ink-900/80">{value}</div>
    </div>
  )
}

function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'danger' | 'success' }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em]',
        tone === 'danger' && 'bg-rust-500/10 text-rust-600',
        tone === 'success' && 'bg-moss-500/10 text-moss-600',
        tone === 'default' && 'bg-ink-900/5 text-ink-900/65',
      )}
    >
      {children}
    </span>
  )
}

function statusTone(status: CaseStatus): 'default' | 'danger' | 'success' {
  if (status === 'RESOLVED') return 'success'
  if (status === 'OPEN') return 'danger'
  return 'default'
}
