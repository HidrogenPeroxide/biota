import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import catalogsJson from '@/data/speciesCatalogs.json'
import { useT } from '@/i18n'

type CatalogMode = 'animals' | 'plants'

interface AnimalEntry {
  id: number
  order: string
  family: string
  commonName: string | null
  scientificName: string | null
}

interface PlantEntry {
  id: number
  family: string
  genus: string
  commonName: string | null
  scientificName: string | null
}

interface CatalogEntry {
  id: number
  primary: string
  secondary: string
  commonName: string | null
  scientificName: string | null
}

const catalogs = catalogsJson as {
  animals: AnimalEntry[]
  plants: PlantEntry[]
}

const PAGE_SIZE = 30

export function SpeciesCatalog() {
  const t = useT()
  const [mode, setMode] = useState<CatalogMode>('animals')
  const [query, setQuery] = useState('')
  const [primary, setPrimary] = useState('')
  const [secondary, setSecondary] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const entries = useMemo<CatalogEntry[]>(
    () => mode === 'animals'
      ? catalogs.animals.map((entry) => ({
          id: entry.id,
          primary: entry.order,
          secondary: entry.family,
          commonName: entry.commonName,
          scientificName: entry.scientificName,
        }))
      : catalogs.plants.map((entry) => ({
          id: entry.id,
          primary: entry.family,
          secondary: entry.genus,
          commonName: entry.commonName,
          scientificName: entry.scientificName,
        })),
    [mode],
  )

  const primaryOptions = useMemo(
    () => countOptions(entries.map((entry) => entry.primary)),
    [entries],
  )

  const secondaryOptions = useMemo(() => {
    const scoped = primary
      ? entries.filter((entry) => entry.primary === primary)
      : entries
    return countOptions(scoped.map((entry) => entry.secondary))
  }, [entries, primary])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return entries.filter((entry) => {
      if (primary && entry.primary !== primary) return false
      if (secondary && entry.secondary !== secondary) return false
      if (!normalizedQuery) return true
      return [
        entry.commonName,
        entry.scientificName,
        entry.primary,
        entry.secondary,
      ].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery))
    })
  }, [entries, primary, query, secondary])

  useEffect(() => {
    setSecondary('')
  }, [mode, primary])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [mode, primary, query, secondary])

  const setCatalogMode = (next: CatalogMode) => {
    setMode(next)
    setPrimary('')
    setSecondary('')
  }

  const visible = filtered.slice(0, visibleCount)
  const primaryLabel = mode === 'animals'
    ? t('stats.catalog.order')
    : t('stats.catalog.family')
  const secondaryLabel = mode === 'animals'
    ? t('stats.catalog.family')
    : t('stats.catalog.genus')

  return (
    <div className="mt-10 border-y border-stone-light/70">
      <div className="flex flex-col gap-5 border-b border-stone-light/70 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div
          className="inline-flex w-fit rounded-lg border border-stone-light bg-ivory-200/60 p-1"
          role="group"
          aria-label={t('stats.catalog.type')}
        >
          {(['animals', 'plants'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCatalogMode(option)}
              aria-pressed={mode === option}
              className={`min-w-28 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === option
                  ? 'bg-forest text-ivory-50'
                  : 'text-charcoal-soft hover:text-forest'
              }`}
            >
              {t(`stats.catalog.${option}`)} {catalogs[option].length}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[44rem]">
          <label className="relative block">
            <span className="sr-only">{t('stats.catalog.search')}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-soft" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('stats.catalog.search')}
              className="h-11 w-full rounded-md border border-stone-light bg-ivory-50 py-2 pl-10 pr-3 text-sm text-charcoal outline-none transition-colors placeholder:text-charcoal-soft/60 focus:border-forest"
            />
          </label>

          <CatalogSelect
            label={primaryLabel}
            value={primary}
            options={primaryOptions}
            allLabel={t('stats.catalog.all', { category: primaryLabel })}
            onChange={setPrimary}
          />
          <CatalogSelect
            label={secondaryLabel}
            value={secondary}
            options={secondaryOptions}
            allLabel={t('stats.catalog.all', { category: secondaryLabel })}
            onChange={setSecondary}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-stone-light/70 py-4 text-xs text-charcoal-soft">
        <span>{t('stats.catalog.results', { count: filtered.length })}</span>
        <span>{t('stats.catalog.source')}</span>
      </div>

      <div className="hidden grid-cols-[3rem_minmax(12rem,1.2fr)_minmax(12rem,1fr)_minmax(10rem,0.9fr)] gap-5 border-b border-stone-light/70 py-3 text-xs font-medium uppercase tracking-wider text-charcoal-soft md:grid">
        <span>{t('stats.catalog.number')}</span>
        <span>{t('stats.catalog.commonName')}</span>
        <span>{t('stats.catalog.scientificName')}</span>
        <span>{t('stats.catalog.classification')}</span>
      </div>

      {visible.length ? (
        <div>
          {visible.map((entry) => {
            const commonName = entry.commonName || entry.scientificName || t('stats.catalog.namePending')
            const scientificName = entry.commonName ? entry.scientificName : null
            return (
              <div
                key={`${mode}-${entry.id}`}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-stone-light/60 py-5 last:border-b-0 md:grid-cols-[3rem_minmax(12rem,1.2fr)_minmax(12rem,1fr)_minmax(10rem,0.9fr)] md:gap-5"
              >
                <span className="font-mono text-xs text-charcoal-soft/60">
                  {String(entry.id).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight text-charcoal">{commonName}</p>
                  {scientificName && (
                    <p className="mt-1 break-words text-sm italic text-charcoal-soft md:hidden">
                      {scientificName}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-charcoal-soft md:hidden">
                    {entry.primary} / {entry.secondary}
                  </p>
                </div>
                <p className="hidden min-w-0 break-words text-sm italic text-charcoal-soft md:block">
                  {scientificName || t('stats.catalog.scientificPending')}
                </p>
                <p className="hidden text-sm text-charcoal-soft md:block">
                  {entry.primary} / {entry.secondary}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-charcoal-soft">
          {t('stats.catalog.noResults')}
        </p>
      )}

      {visibleCount < filtered.length && (
        <div className="border-t border-stone-light/70 py-5 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="text-sm font-medium text-forest underline-offset-4 hover:underline"
          >
            {t('stats.catalog.loadMore', {
              count: Math.min(PAGE_SIZE, filtered.length - visibleCount),
            })}
          </button>
        </div>
      )}
    </div>
  )
}

function CatalogSelect({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; count: number }>
  allLabel: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-stone-light bg-ivory-50 px-3 text-sm text-charcoal outline-none transition-colors focus:border-forest"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value} ({option.count})
          </option>
        ))}
      </select>
    </label>
  )
}

function countOptions(values: string[]) {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'zh-CN'))
}
