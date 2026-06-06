import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type {
  ContractType,
  Gender,
  InternetService,
  MultipleLinesOption,
  PaymentMethod,
  ServiceOption,
  YesNo,
} from '@/types'
import type { CustomerInput, CustomerWithName } from '@/lib/api'
import { ModalPortal } from './ModalPortal'
import { Button } from './ui/Button'
import { Field, Input, Select } from './ui/Field'

interface CustomerFormProps {
  open: boolean
  initial: CustomerWithName | null
  loading?: boolean
  error?: string | null
  onSubmit: (payload: CustomerInput) => void | Promise<void>
  onDelete?: (customer: CustomerWithName) => void
  onClose: () => void
}

const emptyForm: CustomerInput = {
  displayName: '',
  fullName: '',
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 1,
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 0,
  TotalCharges: 0,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
}

function customerToInput(c: CustomerWithName): CustomerInput {
  return {
    displayName: c.displayName,
    fullName: c.fullName ?? c.displayName,
    gender: c.gender,
    SeniorCitizen: c.SeniorCitizen,
    Partner: c.Partner,
    Dependents: c.Dependents,
    tenure: c.tenure,
    Contract: c.Contract,
    PaperlessBilling: c.PaperlessBilling,
    PaymentMethod: c.PaymentMethod,
    MonthlyCharges: c.MonthlyCharges,
    TotalCharges: c.TotalCharges,
    PhoneService: c.PhoneService,
    MultipleLines: c.MultipleLines,
    InternetService: c.InternetService,
    OnlineSecurity: c.OnlineSecurity,
    OnlineBackup: c.OnlineBackup,
    DeviceProtection: c.DeviceProtection,
    TechSupport: c.TechSupport,
    StreamingTV: c.StreamingTV,
    StreamingMovies: c.StreamingMovies,
  }
}

export function CustomerForm({
  open,
  initial,
  loading,
  error,
  onSubmit,
  onDelete,
  onClose,
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerInput>(emptyForm)
  const isEdit = initial !== null

  useEffect(() => {
    if (open) setForm(initial ? customerToInput(initial) : emptyForm)
  }, [open, initial])

  if (!open) return null

  function set<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit(form)
  }

  const hasInternet = form.InternetService !== 'No'

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/45 p-3 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl animate-rise flex-col overflow-hidden border border-ink-900/15 bg-bone-50 shadow-lift sm:max-h-[min(760px,calc(100dvh-3rem))]"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-ink-900/10 px-5 py-4 sm:px-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">
              {isEdit ? 'Edit customer' : 'New customer'}
            </span>
            <h2 className="mt-1 font-display text-2xl text-ink-900">
              {isEdit ? initial?.displayName : 'Add a record'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-ink-900/50 hover:text-ink-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <Section title="Identity">
            <Field label="Full name">
              <Input
                required
                value={form.fullName}
                onChange={(event) => {
                  set('fullName', event.target.value)
                  set('displayName', event.target.value)
                }}
              />
            </Field>
          </Section>

          <Section title="Demographics">
            <Grid>
              <SelectField<Gender> label="Gender" value={form.gender} onChange={(v) => set('gender', v)} options={['Male', 'Female']} />
              <SelectField<'0' | '1'>
                label="Senior citizen"
                value={String(form.SeniorCitizen) as '0' | '1'}
                onChange={(v) => set('SeniorCitizen', v === '1' ? 1 : 0)}
                options={['0', '1']}
                display={(v) => (v === '1' ? 'Yes' : 'No')}
              />
              <SelectField<YesNo> label="Partner" value={form.Partner} onChange={(v) => set('Partner', v)} options={['Yes', 'No']} />
              <SelectField<YesNo> label="Dependents" value={form.Dependents} onChange={(v) => set('Dependents', v)} options={['Yes', 'No']} />
            </Grid>
          </Section>

          <Section title="Account">
            <Grid>
              <NumberField label="Tenure (months)" value={form.tenure} onChange={(v) => set('tenure', v)} min={0} />
              <SelectField<ContractType> label="Contract" value={form.Contract} onChange={(v) => set('Contract', v)} options={['Month-to-month', 'One year', 'Two year']} />
              <NumberField label="Monthly charges" value={form.MonthlyCharges} onChange={(v) => set('MonthlyCharges', v)} step={0.01} min={0} />
              <NumberField label="Total charges" value={form.TotalCharges} onChange={(v) => set('TotalCharges', v)} step={0.01} min={0} />
              <SelectField<YesNo> label="Paperless billing" value={form.PaperlessBilling} onChange={(v) => set('PaperlessBilling', v)} options={['Yes', 'No']} />
              <SelectField<PaymentMethod>
                label="Payment method"
                value={form.PaymentMethod}
                onChange={(v) => set('PaymentMethod', v)}
                options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']}
              />
            </Grid>
          </Section>

          <Section title="Services">
            <Grid>
              <SelectField<YesNo>
                label="Phone service"
                value={form.PhoneService}
                onChange={(v) => {
                  set('PhoneService', v)
                  if (v === 'No') set('MultipleLines', 'No phone service')
                  else if (form.MultipleLines === 'No phone service') set('MultipleLines', 'No')
                }}
                options={['Yes', 'No']}
              />
              <SelectField<MultipleLinesOption>
                label="Multiple lines"
                value={form.MultipleLines}
                onChange={(v) => set('MultipleLines', v)}
                disabled={form.PhoneService === 'No'}
                options={form.PhoneService === 'No' ? ['No phone service'] : ['Yes', 'No']}
              />
              <SelectField<InternetService>
                label="Internet service"
                value={form.InternetService}
                onChange={(v) => {
                  set('InternetService', v)
                  const cascade: ServiceOption = v === 'No' ? 'No internet service' : 'No'
                  set('OnlineSecurity', cascade)
                  set('OnlineBackup', cascade)
                  set('DeviceProtection', cascade)
                  set('TechSupport', cascade)
                  set('StreamingTV', cascade)
                  set('StreamingMovies', cascade)
                }}
                options={['DSL', 'Fiber optic', 'No']}
              />
              {(
                [
                  ['OnlineSecurity', 'Online security'],
                  ['OnlineBackup', 'Online backup'],
                  ['DeviceProtection', 'Device protection'],
                  ['TechSupport', 'Tech support'],
                  ['StreamingTV', 'Streaming TV'],
                  ['StreamingMovies', 'Streaming movies'],
                ] as const
              ).map(([key, label]) => (
                <SelectField<ServiceOption>
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(v) => set(key, v)}
                  disabled={!hasInternet}
                  options={hasInternet ? ['Yes', 'No'] : ['No internet service']}
                />
              ))}
            </Grid>
          </Section>

          {error && (
            <div className="border-l-2 border-rust-500 py-1 pl-3 font-mono text-xs text-rust-500">
              {error}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-ink-900/10 bg-bone-50 px-5 py-4 sm:px-6">
          <div>
            {isEdit && initial && onDelete && (
              <Button type="button" variant="danger" disabled={loading} onClick={() => onDelete(initial)}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex flex-1 gap-3 sm:flex-none">
            <Button type="button" variant="secondary" disabled={loading} onClick={onClose} className="flex-1 sm:w-36">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1 sm:w-44">
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create customer'}
            </Button>
          </div>
        </div>
      </form>
      </div>
    </ModalPortal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">{title}</h3>
      {children}
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        value={value}
        min={min}
        step={step ?? 1}
        onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
        className="font-mono tabular"
      />
    </Field>
  )
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  display,
  disabled,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: T[]
  display?: (value: T) => string
  disabled?: boolean
}) {
  return (
    <Field label={label}>
      <Select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {display ? display(option) : option}
          </option>
        ))}
      </Select>
    </Field>
  )
}
