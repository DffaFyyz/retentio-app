import { useEffect, useState, type ButtonHTMLAttributes, type FormEvent } from 'react'
import { Gift, Pencil, PhoneCall, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react'
import type { CustomerWithName, OutreachInput, RetentionOfferInput } from '@/lib/api'
import { api } from '@/lib/api'
import type { InterventionCase, OfferType, OutreachChannel, OutreachOutcome } from '@/types'
import { RiskBadge } from './RiskBadge'
import { ModalPortal } from './ModalPortal'
import { Button } from './ui/Button'
import { Field, Input, Select, TextArea } from './ui/Field'
import { cn, formatCurrency, formatPercent, prettyEnum, riskTierFor, tenureLabel, tierColor, tierLabel } from '@/lib/utils'

export function CustomerDrawer({
  customer,
  onClose,
  onEdit,
  onDelete,
}: {
  customer: CustomerWithName | null
  onClose: () => void
  onEdit?: (customer: CustomerWithName) => void
  onDelete?: (customer: CustomerWithName) => void
}) {
  const [activeCase, setActiveCase] = useState<InterventionCase | null>(null)
  const [caseLoading, setCaseLoading] = useState(false)
  const [caseError, setCaseError] = useState<string | null>(null)
  const [outreachOpen, setOutreachOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)

  useEffect(() => {
    setActiveCase(null)
    setCaseError(null)
    setOutreachOpen(false)
    setOfferOpen(false)
  }, [customer?.customerID])

  if (!customer) return null

  const selectedCustomer = customer
  const tier = riskTierFor(customer)
  const colors = tierColor[tier]

  async function openCase() {
    setCaseLoading(true)
    setCaseError(null)
    try {
      const result = await api.openInterventionCase({
        customerID: selectedCustomer.customerID,
        priority: selectedCustomer.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      })
      setActiveCase(result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open case'
      setCaseError(message)
      throw error
    } finally {
      setCaseLoading(false)
    }
  }

  async function ensureCase() {
    if (activeCase) return activeCase
    return await openCase()
  }

  async function handleOutreach(payload: OutreachInput) {
    const interventionCase = await ensureCase()
    await api.createOutreachLog(interventionCase.id, payload)
    setActiveCase(await api.getInterventionCase(interventionCase.id))
    setOutreachOpen(false)
  }

  async function handleOffer(payload: RetentionOfferInput) {
    const interventionCase = await ensureCase()
    await api.createRetentionOffer(interventionCase.id, payload)
    setActiveCase(await api.getInterventionCase(interventionCase.id))
    setOfferOpen(false)
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/45 p-0 sm:p-4">
      <div className="flex h-full w-full max-w-[44rem] animate-rise flex-col overflow-hidden border-l border-bone-50/10 bg-ink-900 text-bone-100 shadow-lift sm:h-[calc(100dvh-2rem)] sm:border">
        <div className="flex shrink-0 items-start justify-between border-b border-bone-50/10 px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/70">
              Customer record
            </span>
            <h2 className="mt-1 truncate font-display text-2xl text-bone-50">{customer.displayName}</h2>
            <div className="mt-1 font-mono text-xs text-bone-300/80">ID · {customer.customerID}</div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(customer)} className="p-1 text-bone-300 hover:text-bone-50" aria-label="Edit customer">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(customer)} className="p-1 text-bone-300 hover:text-rust-400" aria-label="Delete customer">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1 text-bone-300 hover:text-bone-50" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="border-b border-bone-50/10 bg-gradient-to-b from-ink-800 to-ink-900 px-5 py-6 sm:px-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/70">
                  Churn probability
                </div>
                <div className={cn('font-display text-6xl leading-none tabular', colors.fg)}>
                  {formatPercent(customer.churnProbability, 1)}
                </div>
              </div>
              <RiskBadge customer={customer} size="md" />
            </div>
            <div className="relative h-1.5 overflow-hidden bg-bone-50/10">
              <div className={cn('absolute inset-y-0 left-0', colors.dot)} style={{ width: `${customer.churnProbability * 100}%` }} />
              <div className="absolute inset-y-0 left-[59%] w-px bg-bone-50/30" aria-hidden />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-bone-300/60">
              <span>0%</span>
              <span>59% model threshold</span>
              <span>100%</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-bone-200/80">
              Model classifies this customer as{' '}
              <span className={cn('font-semibold', colors.fg)}>{tierLabel[tier]} risk</span>.
              {tier === 'high'
                ? ' Recommend retention outreach within 48 hours.'
                : ' Continue standard monitoring.'}
            </p>
          </section>

          <DarkSection title="Top risk factors">
            <div className="space-y-3">
              {customer.riskFactors.map((factor) => (
                <div key={`${factor.feature}-${factor.direction}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      {factor.direction === 'increases' ? (
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-rust-400" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 shrink-0 text-moss-400" />
                      )}
                      <span className="truncate text-bone-100">{factor.feature}</span>
                    </div>
                    <span className="font-mono text-xs text-bone-300 tabular">
                      {(factor.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 bg-bone-50/10">
                    <div
                      className={factor.direction === 'increases' ? 'h-full bg-rust-400' : 'h-full bg-moss-400'}
                      style={{ width: `${Math.min(100, factor.impact * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {customer.riskFactors.length === 0 && <p className="text-sm text-bone-300/70">No risk factors stored.</p>}
            </div>
          </DarkSection>

          <DarkSection title="Account">
            <InfoGrid>
              <Info label="Tenure" value={tenureLabel(customer.tenure)} />
              <Info label="Contract" value={customer.Contract} />
              <Info label="Monthly Charges" value={formatCurrency(customer.MonthlyCharges)} />
              <Info label="Total Charges" value={formatCurrency(customer.TotalCharges)} />
              <Info label="Payment" value={customer.PaymentMethod} />
              <Info label="Paperless Billing" value={customer.PaperlessBilling} />
            </InfoGrid>
          </DarkSection>

          <DarkSection title="Demographics">
            <InfoGrid>
              <Info label="Gender" value={customer.gender} />
              <Info label="Senior Citizen" value={customer.SeniorCitizen === 1 ? 'Yes' : 'No'} />
              <Info label="Partner" value={customer.Partner} />
              <Info label="Dependents" value={customer.Dependents} />
            </InfoGrid>
          </DarkSection>

          <DarkSection title="Subscribed services">
            <InfoGrid>
              <Info label="Phone Service" value={customer.PhoneService} />
              <Info label="Multiple Lines" value={customer.MultipleLines} />
              <Info label="Internet Service" value={customer.InternetService} />
              <Info label="Online Security" value={customer.OnlineSecurity} />
              <Info label="Online Backup" value={customer.OnlineBackup} />
              <Info label="Device Protection" value={customer.DeviceProtection} />
              <Info label="Tech Support" value={customer.TechSupport} />
              <Info label="Streaming TV" value={customer.StreamingTV} />
              <Info label="Streaming Movies" value={customer.StreamingMovies} />
            </InfoGrid>
          </DarkSection>

          {activeCase && (
            <DarkSection title="Active case">
              <div className="flex flex-wrap gap-2">
                <CasePill label={prettyEnum(activeCase.status)} />
                <CasePill label={`${activeCase.priority} priority`} />
                <span className="text-xs text-bone-300/70">Assigned to {activeCase.assignedTo?.name ?? 'Unassigned'}</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <MiniList
                  title="Recent outreach"
                  empty="No outreach logged yet"
                  items={(activeCase.outreachLogs ?? []).slice(0, 3).map((log) => ({
                    id: log.id,
                    title: `${prettyEnum(log.channel)} · ${prettyEnum(log.outcome)}`,
                    detail: log.notes ?? new Date(log.createdAt).toLocaleString(),
                  }))}
                />
                <MiniList
                  title="Retention offers"
                  empty="No offers created yet"
                  items={(activeCase.retentionOffers ?? []).slice(0, 3).map((offer) => ({
                    id: offer.id,
                    title: `${offer.title} · ${prettyEnum(offer.status)}`,
                    detail: offer.description ?? prettyEnum(offer.offerType),
                  }))}
                />
              </div>
            </DarkSection>
          )}

          {caseError && (
            <div className="mx-5 mt-4 border-l-2 border-rust-400 pl-3 font-mono text-xs text-rust-400 sm:mx-7">
              {caseError}
            </div>
          )}

          <div className="grid gap-3 border-t border-bone-50/10 bg-ink-800/45 px-5 py-6 sm:grid-cols-3 sm:px-7">
            <DrawerActionButton
              type="button"
              tone="primary"
              disabled={caseLoading}
              onClick={() => void openCase()}
            >
              {activeCase ? 'Refresh case' : caseLoading ? 'Opening...' : 'Open case'}
            </DrawerActionButton>
            <DrawerActionButton
              type="button"
              onClick={() => setOutreachOpen(true)}
            >
              <PhoneCall className="h-4 w-4" />
              Log outreach
            </DrawerActionButton>
            <DrawerActionButton
              type="button"
              onClick={() => setOfferOpen(true)}
            >
              <Gift className="h-4 w-4" />
              Create offer
            </DrawerActionButton>
          </div>
        </div>
      </div>

        <OutreachModal open={outreachOpen} onClose={() => setOutreachOpen(false)} onSubmit={handleOutreach} />
        <OfferModal open={offerOpen} onClose={() => setOfferOpen(false)} onSubmit={handleOffer} />
      </div>
    </ModalPortal>
  )
}

function DarkSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-bone-50/10 px-5 py-6 sm:px-7">
      <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/70">{title}</h3>
      {children}
    </section>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-bone-300/70">{label}</div>
      <div className="mt-0.5 text-sm text-bone-100">{value}</div>
    </div>
  )
}

function CasePill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 items-center border border-bone-50/15 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-bone-200">
      {label}
    </span>
  )
}

function DrawerActionButton({
  tone = 'secondary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' }) {
  return (
    <button
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 border px-4 font-mono text-xs uppercase tracking-wider transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bone-50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900',
        tone === 'primary' && 'border-bone-50 bg-bone-50 text-ink-900 hover:border-ember-400 hover:bg-ember-400',
        tone === 'secondary' && 'border-bone-50/70 bg-bone-50/10 text-bone-50 hover:border-bone-50 hover:bg-bone-50 hover:text-ink-900',
        className,
      )}
      {...props}
    />
  )
}

function MiniList({
  title,
  empty,
  items,
}: {
  title: string
  empty: string
  items: { id: string; title: string; detail: string }[]
}) {
  return (
    <div>
      <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-bone-300/70">{title}</h4>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="border border-bone-50/10 px-3 py-2 text-xs text-bone-300/60">{empty}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border border-bone-50/10 px-3 py-2">
              <div className="text-sm text-bone-100">{item.title}</div>
              <div className="mt-0.5 text-xs text-bone-300/70">{item.detail}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function OutreachModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: OutreachInput) => Promise<void>
}) {
  const [form, setForm] = useState<OutreachInput>({
    channel: 'PHONE',
    outcome: 'CONTACTED',
    notes: '',
    nextFollowUpAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        channel: form.channel,
        outcome: form.outcome,
        notes: form.notes || undefined,
        nextFollowUpAt: form.nextFollowUpAt || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log outreach')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LightModal title="Log outreach" onClose={onClose} onSubmit={handleSubmit}>
      <Field label="Channel">
        <Select value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value as OutreachChannel }))}>
          {['PHONE', 'EMAIL', 'WHATSAPP', 'SMS', 'IN_APP', 'OTHER'].map((option) => <option key={option} value={option}>{prettyEnum(option)}</option>)}
        </Select>
      </Field>
      <Field label="Outcome">
        <Select value={form.outcome} onChange={(event) => setForm((current) => ({ ...current, outcome: event.target.value as OutreachOutcome }))}>
          {['CONTACTED', 'NO_RESPONSE', 'INTERESTED', 'NOT_INTERESTED', 'COMPLAINED', 'ESCALATED', 'FOLLOW_UP_NEEDED'].map((option) => <option key={option} value={option}>{prettyEnum(option)}</option>)}
        </Select>
      </Field>
      <Field label="Notes">
        <TextArea rows={3} value={form.notes ?? ''} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
      </Field>
      <Field label="Next follow-up date">
        <Input type="date" value={form.nextFollowUpAt ?? ''} onChange={(event) => setForm((current) => ({ ...current, nextFollowUpAt: event.target.value }))} />
      </Field>
      {error && <div className="font-mono text-xs text-rust-500">{error}</div>}
      <ModalActions saving={saving} label="Save outreach" onCancel={onClose} />
    </LightModal>
  )
}

function OfferModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: RetentionOfferInput) => Promise<void>
}) {
  const [form, setForm] = useState<RetentionOfferInput>({
    offerType: 'DISCOUNT',
    title: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        offerType: form.offerType,
        title: form.title,
        description: form.description || undefined,
        discountPercent: form.discountPercent,
        discountAmount: form.discountAmount,
        durationMonths: form.durationMonths,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LightModal title="Create retention offer" onClose={onClose} onSubmit={handleSubmit}>
      <Field label="Offer type">
        <Select value={form.offerType} onChange={(event) => setForm((current) => ({ ...current, offerType: event.target.value as OfferType }))}>
          {['DISCOUNT', 'CONTRACT_UPGRADE', 'FREE_SUPPORT', 'SERVICE_BUNDLE', 'DEVICE_PROTECTION', 'CUSTOM'].map((option) => <option key={option} value={option}>{prettyEnum(option)}</option>)}
        </Select>
      </Field>
      <Field label="Title">
        <Input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
      </Field>
      <Field label="Description">
        <TextArea rows={3} value={form.description ?? ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Discount %">
          <Input type="number" value={form.discountPercent?.toString() ?? ''} onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value ? Number(event.target.value) : undefined, discountAmount: undefined }))} />
        </Field>
        <Field label="Amount">
          <Input type="number" value={form.discountAmount?.toString() ?? ''} onChange={(event) => setForm((current) => ({ ...current, discountAmount: event.target.value ? Number(event.target.value) : undefined, discountPercent: undefined }))} />
        </Field>
        <Field label="Months">
          <Input type="number" value={form.durationMonths?.toString() ?? ''} onChange={(event) => setForm((current) => ({ ...current, durationMonths: event.target.value ? Number(event.target.value) : undefined }))} />
        </Field>
      </div>
      {error && <div className="font-mono text-xs text-rust-500">{error}</div>}
      <ModalActions saving={saving} label="Create offer" onCancel={onClose} />
    </LightModal>
  )
}

function LightModal({
  title,
  onClose,
  onSubmit,
  children,
}: {
  title: string
  onClose: () => void
  onSubmit: (event: FormEvent) => void
  children: React.ReactNode
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-900/50 p-4 sm:p-6">
      <form onSubmit={onSubmit} className="w-full max-w-lg animate-rise border border-ink-900/15 bg-bone-50 text-ink-900 shadow-lift">
        <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
          <h3 className="font-display text-xl">{title}</h3>
          <button type="button" onClick={onClose} className="text-ink-900/50 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">{children}</div>
      </form>
      </div>
    </ModalPortal>
  )
}

function ModalActions({ saving, label, onCancel }: { saving: boolean; label: string; onCancel: () => void }) {
  return (
    <div className="-mx-5 -mb-5 mt-2 grid grid-cols-2 border-t border-ink-900/10">
      <Button type="button" variant="ghost" className="h-12" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" className="h-12 border-y-0 border-r-0" disabled={saving}>
        {saving ? 'Saving...' : label}
      </Button>
    </div>
  )
}
