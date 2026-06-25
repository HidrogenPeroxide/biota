import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  CircleDot,
  SlidersHorizontal,
  X,
  Info,
  Search,
} from 'lucide-react'
import { ObservationMap } from '@/components/map/ObservationMap'
import { SpeciesSearch } from '@/components/map/SpeciesSearch'
import { PageTransition } from '@/components/motion/PageTransition'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAsync } from '@/hooks/useAsync'
import { fetchObservations } from '@/api/inaturalist'
import { ICONIC_META, TAXONOMY_ROOT, iconColor, iconicLabel } from '@/data/taxonomy'
import { formatCompact } from '@/lib/utils'
import type { Observation, Taxon } from '@/types'
import { useT } from '@/i18n'

type Mode = 'markers' | 'heat'

const ease = [0.22, 1, 0.36, 1] as const

// Year range for the time slider (recent window keeps the dataset lively).
const YEAR_MIN = 2015
const YEAR_MAX = new Date().getFullYear()

export function MapExplore() {
  const t = useT()
  const [mode, setMode] = useState<Mode>('markers')
  const [taxon, setTaxon] = useState<Taxon | null>(null)
  const [group, setGroup] = useState<string | null>(null)
  const [year, setYear] = useState<number>(YEAR_MAX)
  const [panelOpen, setPanelOpen] = useState(true)

  const { data: observations, loading } = useAsync<Observation[]>(
    () =>
      fetchObservations({
        taxon_id: taxon?.id,
        iconic_taxa: group ?? undefined,
        d1: `${year}-01-01`,
        d2: `${year}-12-31`,
        order_by: 'observed_on',
        order: 'desc',
        per_page: 250,
      }),
    [taxon?.id, group, year],
  )

  // Aggregate a quick top-species summary for the side panel.
  const summary = useMemo(() => {
    if (!observations) return []
    const map = new Map<string, { name: string; count: number; iconic?: string }>()
    for (const o of observations) {
      if (!o.taxon) continue
      const key = o.taxon.name
      const existing = map.get(key)
      if (existing) existing.count += 1
      else
        map.set(key, {
          name: o.taxon.preferred_common_name || o.taxon.name,
          count: 1,
          iconic: o.taxon.iconic_taxon_name ?? undefined,
        })
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 8)
  }, [observations])

  const flyTarget = useMemo(() => {
    if (!observations?.length) return undefined
    const pts = observations
      .map((o) => ({
        lat: o.latitude ?? Number(o.location?.split(',')[0]),
        lng: o.longitude ?? Number(o.location?.split(',')[1]),
      }))
      .filter(
        (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
      )
    if (!pts.length) return undefined
    const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length
    const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length
    return { center: [lat, lng] as [number, number], zoom: 3, key: `${taxon?.id}-${group}-${year}` }
  }, [observations, taxon?.id, group, year])

  return (
    <PageTransition>
      <div className="relative h-[calc(100vh-0px)] w-full overflow-hidden">
        {/* Map fills the screen */}
        <div className="absolute inset-0">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ObservationMap
              observations={observations ?? []}
              mode={mode}
              flyTo={flyTarget}
              interactive
              className="h-full w-full"
            />
          )}
        </div>

        {/* Top bar: search + filters — sits below the solid navbar on all screens */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-4 pt-[84px]">
          <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3">
            <div className="hidden flex-1 md:block">
              <SpeciesSearch
                onSelect={(t) => {
                  setTaxon(t)
                  setGroup(null)
                }}
              />
            </div>
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-stone-light/80 bg-ivory-50/90 px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm backdrop-blur-md transition-colors hover:bg-ivory-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{t('map.filters')}</span>
            </button>
          </div>
          <div className="pointer-events-auto mx-auto mt-2 max-w-3xl md:hidden">
            <SpeciesSearch
              onSelect={(t) => {
                setTaxon(t)
                setGroup(null)
              }}
            />
          </div>
        </div>

        {/* Active filter chips */}
        {(taxon || group || mode === 'heat') && (
          <div className="pointer-events-none absolute inset-x-0 top-[148px] z-[1000] flex justify-center px-4 md:top-[148px]">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-full border border-stone-light/70 bg-ivory-50/90 px-3 py-2 shadow-sm backdrop-blur-md">
              {taxon && (
                <ActiveChip
                  label={taxon.preferred_common_name || taxon.name}
                  onClear={() => setTaxon(null)}
                />
              )}
              {group && (
                <ActiveChip
                  label={iconicLabel(t, group)}
                  onClear={() => setGroup(null)}
                />
              )}
              <span className="px-1 text-xs leading-cn text-charcoal-soft">
                {formatCompact(observations?.length ?? 0)} {t('map.shown')} · {year}
              </span>
            </div>
          </div>
        )}

        {/* Control panel (slides in from left) */}
        <AnimatePresence>
          {panelOpen && (
            <motion.aside
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.6, ease }}
              className="absolute bottom-4 left-4 top-[150px] z-[1000] flex w-[88vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-stone-light/70 bg-ivory-50/95 shadow-2xl backdrop-blur-xl md:top-[150px]"
            >
              <div className="flex items-center justify-between border-b border-stone-light/60 px-5 py-4">
                <div>
                  <p className="eyebrow">{t('map.controls')}</p>
                  <h2 className="font-display text-lg text-charcoal">
                    {t('map.controlsTitle')}
                  </h2>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-light text-charcoal-soft hover:bg-ivory-200"
                  aria-label={t('map.collapse')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                {/* Layer mode */}
                <ControlGroup label={t('map.layer')}>
                  <div className="grid grid-cols-2 gap-2">
                    <ModeButton
                      active={mode === 'markers'}
                      onClick={() => setMode('markers')}
                      icon={<CircleDot className="h-4 w-4" />}
                      label={t('map.layerMarkers')}
                    />
                    <ModeButton
                      active={mode === 'heat'}
                      onClick={() => setMode('heat')}
                      icon={<Flame className="h-4 w-4" />}
                      label={t('map.layerHeat')}
                    />
                  </div>
                </ControlGroup>

                {/* Group filter */}
                <ControlGroup label={t('map.branch')}>
                  <div className="flex flex-wrap gap-1.5">
                    <FilterChip
                      active={!group}
                      onClick={() => setGroup(null)}
                      label={t('map.all')}
                    />
                    {TAXONOMY_ROOT.filter((n) => n.iconic).map((n) => (
                      <FilterChip
                        key={n.id}
                        active={group === n.iconic}
                        onClick={() => {
                          setGroup(group === n.iconic ? null : n.iconic!)
                          setTaxon(null)
                        }}
                        label={iconicLabel(t, n.iconic)}
                        color={iconColor(n.iconic)}
                      />
                    ))}
                  </div>
                </ControlGroup>

                {/* Time slider */}
                <ControlGroup label={t('map.time', { year })}>
                  <input
                    type="range"
                    min={YEAR_MIN}
                    max={YEAR_MAX}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="slider-earth w-full"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-charcoal-soft">
                    <span>{YEAR_MIN}</span>
                    <span>{YEAR_MAX}</span>
                  </div>
                </ControlGroup>

                {/* Top species summary */}
                <ControlGroup label={t('map.inView')}>
                  {summary.length ? (
                    <ul className="space-y-1.5">
                      {summary.map((s, i) => (
                        <motion.li
                          key={s.name}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.04 }}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ background: iconColor(s.iconic) }}
                            />
                            <span className="truncate leading-cn text-charcoal">
                              {s.name}
                            </span>
                          </span>
                          <span className="ml-2 shrink-0 text-xs text-charcoal-soft">
                            {s.count}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-cn text-charcoal-soft">
                      {loading ? t('common.loading') : t('common.noData')}
                    </p>
                  )}
                </ControlGroup>
              </div>

              <div className="border-t border-stone-light/60 px-5 py-3 text-[11px] leading-cn text-charcoal-soft">
                <Info className="mr-1 inline h-3 w-3" />
                {t('map.viewNote')}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapsed-state reopen button */}
        {!panelOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setPanelOpen(true)}
            className="absolute left-4 top-1/2 z-[1000] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-light/70 bg-ivory-50/90 text-forest shadow-lg backdrop-blur-md hover:bg-ivory-50"
            aria-label={t('map.open')}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </motion.button>
        )}

        {/* Empty / hint overlay */}
        {!loading && !observations?.length && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-stone-light/70 bg-ivory-50/90 px-4 py-2 text-sm leading-cn text-charcoal-soft shadow-sm backdrop-blur-md">
              <Search className="h-4 w-4" />
              {t('map.tryDifferent')}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}

/* ------------------------------ bits ------------------------------ */

function ControlGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-charcoal-soft">
        {label}
      </p>
      {children}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-organic ${
        active
          ? 'border-forest bg-forest text-ivory-50'
          : 'border-stone-light bg-ivory-50 text-charcoal hover:border-stone'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-organic ${
        active
          ? 'border-forest bg-forest/10 text-forest'
          : 'border-stone-light bg-ivory-50 text-charcoal-soft hover:border-stone'
      }`}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color, opacity: active ? 1 : 0.5 }}
        />
      )}
      {label}
    </button>
  )
}

function ActiveChip({
  label,
  onClear,
}: {
  label: string
  onClear: () => void
}) {
  return (
    <Badge variant="default" className="gap-1.5 py-1.5">
      <span className="max-w-[160px] truncate">{label}</span>
      <button onClick={onClear} aria-label={`Clear ${label}`}>
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
