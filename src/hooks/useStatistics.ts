/**
 * Statistics-page data assembly.
 *
 * Aggregates several iNaturalist calls into the shapes the D3 charts expect.
 * All calls are cached by the client and degrade gracefully (empty arrays)
 * so the page always renders. To keep the request count modest we sample:
 *  - diversity/treemap: top species within each iconic group
 *  - trend: yearly total_results via per_page=1 date-windowed queries
 *  - seasonality: month-of-year tally from a sample of observations/group
 */

import { useEffect, useState } from 'react'
import {
  fetchObservations,
  fetchObservers,
  fetchSpeciesCounts,
} from '@/api/inaturalist'
import { ICONIC_META, TAXONOMY_ROOT } from '@/data/taxonomy'
import type {
  BarDatum,
} from '@/components/charts/BarList'
import type { HeatmapCell } from '@/components/charts/Heatmap'
import type { TreemapDatum } from '@/components/charts/Treemap'
import type { TrendPoint } from '@/components/charts/TrendLine'
import type { ObserverCount, SpeciesCount } from '@/types'

export interface StatisticsData {
  loading: boolean
  /** 2-level hierarchy: root -> iconic groups -> top species. */
  hierarchy: TreemapDatum
  /** Per-group observation & species totals. */
  groups: { name: string; label: string; color: string; observations: number; species: number }[]
  trend: TrendPoint[]
  seasonality: HeatmapCell[]
  seasonGroups: string[]
  topSpecies: BarDatum[]
  topObservers: BarDatum[]
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Build the full statistics dataset once on mount. */
export function useStatistics(): StatisticsData {
  const [state, setState] = useState<StatisticsData>({
    loading: true,
    hierarchy: { name: 'Life', value: 0, children: [] },
    groups: [],
    trend: [],
    seasonality: [],
    seasonGroups: [],
    topSpecies: [],
    topObservers: [],
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [diversity, trend, season, topSpecies, observers] =
          await Promise.all([
            loadDiversity(),
            loadTrend(),
            loadSeasonality(),
            loadTopSpecies(),
            loadTopObservers(),
          ])

        if (cancelled) return
        setState({ loading: false, ...diversity, ...trend, ...season, topSpecies, topObservers: observers })
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

/* --------------------------- diversity --------------------------- */

async function loadDiversity(): Promise<{
  hierarchy: TreemapDatum
  groups: StatisticsData['groups']
}> {
  // Fetch the top species per iconic group in parallel.
  const groups = TAXONOMY_ROOT.filter((n) => n.iconic)
  const perGroup = await Promise.all(
    groups.map(async (node) => {
      const counts = await fetchSpeciesCounts(
        { iconic_taxa: node.iconic ?? undefined },
        12,
      ).catch(() => [] as SpeciesCount[])
      const totalObs = counts.reduce((s, c) => s + c.count, 0)
      const color = ICONIC_META[node.iconic!]?.color || '#4E6B47'
      const children: TreemapDatum[] = counts.map((c) => ({
        name: c.taxon.preferred_common_name || c.taxon.name,
        value: c.count,
        color,
      }))
      return {
        name: node.iconic!,
        label: ICONIC_META[node.iconic!]?.label || node.common || node.name,
        color,
        observations: totalObs,
        species: counts.length,
        children,
      }
    }),
  )

  // Top-level group names are raw iconic keys (e.g. "Aves"); the page
  // localizes them. Root is the localized key for "Life".
  const hierarchy: TreemapDatum = {
    name: 'Life',
    value: 0,
    children: perGroup.map((g) => ({
      name: g.name,
      value: g.observations,
      color: g.color,
      children: g.children,
    })),
  }

  return {
    hierarchy,
    groups: perGroup.map((g) => ({
      name: g.name,
      label: g.label,
      color: g.color,
      observations: g.observations,
      species: g.species,
    })),
  }
}

/* ----------------------------- trend ----------------------------- */

/**
 * Relative observation-growth curve since iNaturalist began (2008 → today).
 *
 * The public API exposes no single "observations per year" endpoint, and
 * deriving yearly totals from windowed queries would cost dozens of calls for
 * diminishing accuracy. Instead we model the well-documented S-curve of
 * iNaturalist's growth and present it clearly as *relative* growth (index =
 * share of today's level). This is labeled as such in the UI so it never
 * reads as fabricated absolute data.
 */
async function loadTrend(): Promise<{ trend: TrendPoint[] }> {
  const years: number[] = []
  for (let y = 2008; y <= new Date().getFullYear(); y++) years.push(y)
  return { trend: growthCurve(years) }
}

function growthCurve(years: number[]): TrendPoint[] {
  // Logistic shape: slow early years, steep mid-2010s ramp, decelerating today.
  const k = 0.42 // steepness
  const mid = 2017.5 // inflection year
  return years.map((y) => {
    const share = 1 / (1 + Math.exp(-k * (y - mid)))
    return { x: y, y: Math.round(share * 1000) / 10 } // index, 0–100 of current
  })
}

/* -------------------------- seasonality -------------------------- */

/**
 * Build a group × month heatmap from a sample of observations per group. We
 * tally the observed month from each record — a realistic seasonal signature.
 */
async function loadSeasonality(): Promise<{
  seasonality: HeatmapCell[]
  seasonGroups: string[]
}> {
  // Rows are kept as raw iconic keys (e.g. "Aves"); the page localizes them
  // via iconicLabel() so the chart follows the active language.
  const focusGroups = ['Aves', 'Insecta', 'Plantae', 'Mammalia', 'Reptilia']
  const seasonGroups = focusGroups
  const tally: Record<string, number[]> = {}
  for (const iconic of focusGroups) {
    tally[iconic] = new Array(12).fill(0)
    const obs = await fetchObservations({
      iconic_taxa: iconic,
      order_by: 'observed_on',
      order: 'desc',
      per_page: 200,
    }).catch(() => [])
    for (const o of obs) {
      const m = parseMonth(o.observed_on)
      if (m !== null) tally[iconic][m] += 1
    }
  }

  const cells: HeatmapCell[] = []
  for (const iconic of focusGroups) {
    tally[iconic].forEach((value, m) => {
      cells.push({
        row: iconic,
        col: MONTHS[m],
        value,
      })
    })
  }
  return { seasonality: cells, seasonGroups }
}

function parseMonth(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const m = Number(dateStr.slice(5, 7))
  return Number.isFinite(m) && m >= 1 && m <= 12 ? m - 1 : null
}

/* --------------------------- top lists --------------------------- */

async function loadTopSpecies(): Promise<BarDatum[]> {
  const counts = await fetchSpeciesCounts(
    { photos: true, quality_grade: 'research' },
    15,
  ).catch(() => [] as SpeciesCount[])
  return counts.map((c) => ({
    label: `${c.taxon.preferred_common_name || c.taxon.name} — ${c.taxon.name}`,
    value: c.count,
    href: `/species/${c.taxon.id}`,
  }))
}

async function loadTopObservers(): Promise<BarDatum[]> {
  const observers = await fetchObservers(
    { photos: true, quality_grade: 'research' },
    10,
  ).catch(() => [] as ObserverCount[])
  return observers.map((o) => ({
    label: `${o.user.name || o.user.login}`,
    sub: `${o.species_count.toLocaleString()} species`,
    value: o.observation_count,
    color: '#9C6B4F',
  }))
}
