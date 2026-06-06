import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Plus, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { CustomerDrawer } from '@/components/CustomerDrawer'
import { CustomerForm } from '@/components/CustomerForm'
import { CustomerTable } from '@/components/CustomerTable'
import { FilterBar } from '@/components/FilterBar'
import { EmptyState, ErrorState, LoadingState } from '@/components/StatusStates'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/Panel'
import { api, type CustomerInput, type CustomerListParams, type CustomerWithName } from '@/lib/api'
import { downloadCsv } from '@/lib/csv'
import { useApi } from '@/hooks/useApi'
import type { FilterState } from '@/types'

const initialFilters: FilterState = {
  search: '',
  minProbability: 0,
  maxProbability: 100,
  contract: 'all',
  internet: 'all',
  tenureRange: 'all',
  riskTier: 'all',
}

export function CustomersPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<CustomerWithName | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formInitial, setFormInitial] = useState<CustomerWithName | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CustomerWithName | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 350)
    return () => window.clearTimeout(timeout)
  }, [filters.search])

  const customerQuery = useMemo(() => buildCustomerQuery(filters, debouncedSearch, page, limit), [filters, debouncedSearch, page, limit])
  const filterQuery = useMemo(() => buildCustomerQuery(filters, debouncedSearch, 1, 100), [filters, debouncedSearch])

  const { data, loading, error, refetch } = useApi(() => api.listCustomers(customerQuery), [customerQuery])
  const customers = data?.data ?? []
  const meta = data?.meta ?? { page, limit, totalRecords: 0, totalPages: 1 }

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(initialFilters)

  function openCreateForm() {
    setFormInitial(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEditForm(customer: CustomerWithName) {
    setSelected(null)
    setFormInitial(customer)
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSubmitCustomer(payload: CustomerInput) {
    setSaving(true)
    setFormError(null)
    try {
      if (formInitial) await api.updateCustomer(formInitial.customerID, payload)
      else await api.createCustomer(payload)
      setFormOpen(false)
      setFormInitial(null)
      refetch()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCustomer() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.deleteCustomer(deleteTarget.customerID)
      setSelected(null)
      setFormOpen(false)
      setFormInitial(null)
      setDeleteTarget(null)
      refetch()
    } finally {
      setDeleting(false)
    }
  }

  async function exportFilteredCustomers() {
    setExporting(true)
    setExportError(null)
    try {
      const first = await api.listCustomers(filterQuery)
      const all = [...first.data]
      for (let next = 2; next <= first.meta.totalPages; next += 1) {
        const pageResult = await api.listCustomers({ ...filterQuery, page: next })
        all.push(...pageResult.data)
      }

      downloadCsv(
        `churn-customers-${new Date().toISOString().slice(0, 10)}.csv`,
        all.map((customer) => ({
          customerID: customer.customerID,
          fullName: customer.displayName,
          churnProbability: customer.churnProbability,
          riskLevel: customer.riskLevel ?? '',
          contract: customer.Contract,
          tenure: customer.tenure,
          monthlyCharges: customer.MonthlyCharges,
          totalCharges: customer.TotalCharges,
          internetService: customer.InternetService,
          paymentMethod: customer.PaymentMethod,
          topRiskFactor: customer.riskFactors[0]?.feature ?? '',
          lastPredictedAt: customer.lastPredictedAt ?? '',
        })),
      )
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export customers')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <PageHeader
        eyebrow="Directory"
        title="Customers"
        description="Filter, sort, and inspect every customer record. Tap a row for the full risk breakdown."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={openCreateForm} variant="primary">
              <Plus className="h-3.5 w-3.5" />
              Create customer
            </Button>
            <Button onClick={exportFilteredCustomers} disabled={meta.totalRecords === 0 || exporting}>
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        }
      />

      {exportError && <div className="border-l-2 border-rust-500 pl-3 font-mono text-xs text-rust-500">{exportError}</div>}

      {loading && !data ? (
        <div className="border border-ink-900/10 bg-bone-50">
          <LoadingState message="Loading customers..." />
        </div>
      ) : error ? (
        <div className="border border-ink-900/10 bg-bone-50">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : customers.length === 0 && !isFiltered ? (
        <div className="border border-ink-900/10 bg-bone-50">
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No customers yet"
            message="Create a customer or seed the backend to start scoring churn risk."
          />
        </div>
      ) : (
        <>
          <FilterBar
            filters={filters}
            onChange={(next) => {
              setFilters(next)
              setPage(1)
            }}
            resultCount={customers.length}
            totalCount={meta.totalRecords}
          />
          {customers.length === 0 ? (
            <div className="border border-ink-900/10 bg-bone-50">
              <EmptyState icon={<Users className="h-5 w-5" />} title="No matching customers" message="Adjust the search or filters to broaden the list." />
            </div>
          ) : (
            <>
              <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                <CustomerTable customers={customers} onSelect={setSelected} />
              </div>
              <PaginationControls
                page={meta.page}
                limit={meta.limit}
                totalRecords={meta.totalRecords}
                totalPages={meta.totalPages}
                onPageChange={setPage}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit)
                  setPage(1)
                }}
              />
            </>
          )}
          {loading && <div className="text-center font-mono text-[11px] text-ink-900/40">Updating results...</div>}
        </>
      )}

      <CustomerDrawer customer={selected} onClose={() => setSelected(null)} onEdit={openEditForm} onDelete={setDeleteTarget} />
      <CustomerForm
        open={formOpen}
        initial={formInitial}
        loading={saving}
        error={formError}
        onSubmit={handleSubmitCustomer}
        onDelete={setDeleteTarget}
        onClose={() => {
          setFormOpen(false)
          setFormInitial(null)
          setFormError(null)
        }}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete customer?"
        message={deleteTarget ? `${deleteTarget.displayName} and its prediction history will be permanently removed.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteCustomer}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function buildCustomerQuery(filters: FilterState, search: string, page: number, limit: number): CustomerListParams {
  const tenure =
    filters.tenureRange === '0-12'
      ? { minTenure: 0, maxTenure: 12 }
      : filters.tenureRange === '13-24'
        ? { minTenure: 13, maxTenure: 24 }
        : filters.tenureRange === '25-48'
          ? { minTenure: 25, maxTenure: 48 }
          : filters.tenureRange === '49+'
            ? { minTenure: 49 }
            : {}

  return {
    page,
    limit,
    search: search || undefined,
    minProbability: filters.minProbability > 0 ? filters.minProbability / 100 : undefined,
    maxProbability: filters.maxProbability < 100 ? filters.maxProbability / 100 : undefined,
    contract: filters.contract !== 'all' ? filters.contract : undefined,
    internet: filters.internet !== 'all' ? filters.internet : undefined,
    riskLevel: filters.riskTier === 'high' ? 'HIGH' : filters.riskTier === 'low' ? 'LOW' : undefined,
    ...tenure,
  }
}

function PaginationControls({
  page,
  limit,
  totalRecords,
  totalPages,
  onPageChange,
  onLimitChange,
}: {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) {
  const start = totalRecords === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, totalRecords)

  return (
    <div className="flex flex-col gap-3 border border-ink-900/10 bg-bone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="font-mono text-xs text-ink-900/55 tabular">
        Showing {start}-{end} of {totalRecords}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-mono text-xs text-ink-900/55">
          Rows
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-8 border border-ink-900/15 bg-bone-50 px-2 font-mono text-xs focus:outline-none"
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <Button size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-24 text-center font-mono text-xs text-ink-900/65 tabular">
            Page {page} / {Math.max(totalPages, 1)}
          </span>
          <Button size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
