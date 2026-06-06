import { Search, X } from 'lucide-react'
import type { FilterState } from '@/types'
import { Button } from './ui/Button'
import { Select } from './ui/Field'

const resetFilters: FilterState = {
  search: '',
  minProbability: 0,
  maxProbability: 100,
  contract: 'all',
  internet: 'all',
  tenureRange: 'all',
  riskTier: 'all',
}

export function FilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: {
  filters: FilterState
  onChange: (next: FilterState) => void
  resultCount: number
  totalCount: number
}) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(resetFilters)

  return (
    <section className="border border-ink-900/10 bg-bone-50">
      <div className="flex flex-col gap-3 border-b border-ink-900/10 px-4 py-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-900/40" />
          <input
            type="text"
            placeholder="Search by name, customer ID, contract, or internet..."
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            className="h-10 w-full bg-transparent pl-10 pr-4 text-sm placeholder:text-ink-900/35 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="whitespace-nowrap font-mono text-xs text-ink-900/55 tabular">
            {resultCount}<span className="text-ink-900/30"> / </span>{totalCount}
          </span>
          {isFiltered && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(resetFilters)}>
              <X className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-4 py-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(8rem,auto))] lg:items-end">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/55">
              Churn probability
            </span>
            <span className="font-mono text-[11px] text-ink-900/75 tabular">
              {filters.minProbability}% - {filters.maxProbability}%
            </span>
          </div>
          <div className="relative flex h-8 items-center">
            <div className="absolute inset-x-0 h-1 bg-ink-900/10" />
            <div
              className="absolute h-1 bg-ember-500"
              style={{
                left: `${filters.minProbability}%`,
                right: `${100 - filters.maxProbability}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={filters.minProbability}
              onChange={(event) => update('minProbability', Math.min(Number(event.target.value), filters.maxProbability))}
              className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-900"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={filters.maxProbability}
              onChange={(event) => update('maxProbability', Math.max(Number(event.target.value), filters.minProbability))}
              className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-900"
            />
          </div>
        </div>

        <FilterSelect
          label="Contract"
          value={filters.contract}
          onChange={(value) => update('contract', value as FilterState['contract'])}
          options={[
            ['all', 'Any'],
            ['Month-to-month', 'Monthly'],
            ['One year', '1 Year'],
            ['Two year', '2 Year'],
          ]}
        />
        <FilterSelect
          label="Internet"
          value={filters.internet}
          onChange={(value) => update('internet', value as FilterState['internet'])}
          options={[
            ['all', 'Any'],
            ['Fiber optic', 'Fiber'],
            ['DSL', 'DSL'],
            ['No', 'None'],
          ]}
        />
        <FilterSelect
          label="Tenure"
          value={filters.tenureRange}
          onChange={(value) => update('tenureRange', value as FilterState['tenureRange'])}
          options={[
            ['all', 'Any'],
            ['0-12', '0-12 mo'],
            ['13-24', '13-24 mo'],
            ['25-48', '25-48 mo'],
            ['49+', '49+ mo'],
          ]}
        />
        <FilterSelect
          label="Risk tier"
          value={filters.riskTier}
          onChange={(value) => update('riskTier', value as FilterState['riskTier'])}
          options={[
            ['all', 'Any'],
            ['high', 'High'],
            ['low', 'Low'],
          ]}
        />
      </div>
    </section>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<[string, string]>
}) {
  return (
    <label className="space-y-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-900/55">
        {label}
      </span>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </Select>
    </label>
  )
}
