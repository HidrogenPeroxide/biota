/**
 * iNaturalist API client
 * =====================
 *
 * Thin, typed wrapper around the public iNaturalist REST API (v1).
 *
 * Base URL: https://api.inaturalist.org/v1
 *
 * Key endpoints used by the atlas:
 *   GET /observations                — search observations (filters, paging)
 *   GET /observations/{id}           — a single observation
 *   GET /observations/species_counts — aggregate species counts (great for stats)
 *   GET /observations/observers      — top contributors
 *   GET /taxa                        — search taxa
 *   GET /taxa/{id}                   — rich taxon detail (desc, photos, ancestors)
 *   GET /taxa/autocomplete           — type-ahead taxon search
 *
 * The API supports CORS for browser GET requests and needs no key for
 * read-only public data. It is rate-limited (~100 req/min per IP), so the
 * client adds an in-memory TTL cache and collapses duplicate in-flight
 * requests. If a request fails (network / rate-limit / CORS), the caller
 * receives `null` and the UI layer decides whether to show a fallback.
 */

import type {
  iNatResponse,
  Observation,
  ObserverCount,
  SpeciesCount,
  Taxon,
} from '@/types'

const BASE_URL = 'https://api.inaturalist.org/v1'

/**
 * Active locale. iNaturalist localizes `preferred_common_name` per request,
 * so setting `locale=zh` returns Chinese common names. Driven by the i18n
 * context via `setApiLocale()`.
 */
let activeLocale: 'zh' | 'en' = 'zh'
export function setApiLocale(locale: 'zh' | 'en') {
  activeLocale = locale
}

/** Build a query string from a record, skipping null/undefined/empty values.
 *  The active locale is always merged in so common names come back localized. */
function qs(params: Record<string, unknown>): string {
  const entries = Object.entries({ locale: activeLocale, ...params })
    .filter(([, v]) => v !== undefined && v !== null && `${v}` !== '')
    .map(([k, v]) => [k, String(v)])
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

interface CacheEntry<T> {
  value: T
  expires: number
}

/** Simple TTL cache shared across all calls in the session. */
const cache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes

function getCached<T>(key: string): T | undefined {
  const hit = cache.get(key)
  if (!hit) return undefined
  if (Date.now() > hit.expires) {
    cache.delete(key)
    return undefined
  }
  return hit.value as T
}

function setCached<T>(key: string, value: T, ttl = DEFAULT_TTL): void {
  cache.set(key, { value, expires: Date.now() + ttl })
}

/** Deduplicate identical concurrent requests. */
async function dedupe<T>(key: string, producer: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== undefined) return cached
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>
  const promise = producer().finally(() => inflight.delete(key))
  inflight.set(key, promise)
  const value = await promise
  setCached(key, value)
  return value
}

/** Fetch JSON with a timeout; resolves to null on any failure. */
async function getJSON<T>(path: string, ttl = DEFAULT_TTL): Promise<T | null> {
  const url = BASE_URL + path
  return dedupe(`GET ${url}`, async () => {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 12000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      clearTimeout(timer)
      if (!res.ok) {
        // 429 = rate limited; let the caller fall back.
        console.warn(`[iNat] ${res.status} for ${path}`)
        return null
      }
      const data = (await res.json()) as T
      return data
    } catch (err) {
      console.warn(`[iNat] request failed for ${path}:`, err)
      return null
    }
  })
}

/* ----------------------------- Taxa ----------------------------- */

export interface TaxonDetailParams {
  /** Include the full ancestor chain in the response. */
  includeAncestors?: boolean
}

/** Fetch a single richly-detailed taxon by id. */
export async function fetchTaxon(
  id: number | string,
  opts: TaxonDetailParams = {},
): Promise<Taxon | null> {
  const params: Record<string, unknown> = { is_active: true }
  if (opts.includeAncestors) params.include = 'ancestors'
  const data = await getJSON<iNatResponse<Taxon>>(
    `/taxa/${id}${qs(params)}`,
    1000 * 60 * 30,
  )
  return data?.results?.[0] ?? null
}

/** Type-ahead / free-text taxon search. */
export async function searchTaxa(
  query: string,
  perPage = 12,
): Promise<Taxon[]> {
  if (!query.trim()) return []
  const data = await getJSON<iNatResponse<Taxon>>(
    `/taxa/autocomplete${qs({ q: query, is_active: true, per_page: perPage })}`,
  )
  return data?.results ?? []
}

/** Fetch the direct children taxa of a parent (used to lazily grow the tree). */
export async function fetchTaxonChildren(
  parentId: number | string,
  perPage = 30,
): Promise<Taxon[]> {
  const data = await getJSON<iNatResponse<Taxon>>(
    `/taxa${qs({
      parent_id: parentId,
      is_active: true,
      rank_level: 'gen,sp',
      per_page: perPage,
      order: 'name',
      order_by: 'name',
    })}`,
    1000 * 60 * 10,
  )
  return data?.results ?? []
}

/* -------------------------- Observations ------------------------- */

export interface ObservationQuery {
  taxon_id?: number
  place_id?: number
  q?: string
  lat?: number
  lng?: number
  radius?: number // kilometers
  photos?: boolean
  quality_grade?: string // 'research' | 'needs_id' | 'casual' | 'any'
  license?: string
  per_page?: number
  page?: number
  order_by?: string
  order?: string
  d1?: string // start date YYYY-MM-DD
  d2?: string // end date YYYY-MM-DD
  iconic_taxa?: string
}

/** Search observations. Falls back to null so callers can show fallback UI. */
export async function fetchObservations(
  query: ObservationQuery,
): Promise<Observation[]> {
  const params: Record<string, unknown> = {
    photos: true,
    quality_grade: 'research',
    per_page: 24,
    order_by: 'votes',
    order: 'desc',
    ...query,
  }
  const data = await getJSON<iNatResponse<Observation>>(
    `/observations${qs(params)}`,
  )
  return data?.results ?? []
}

/** A single observation by id. */
export async function fetchObservation(id: number | string): Promise<Observation | null> {
  const data = await getJSON<iNatResponse<Observation>>(`/observations/${id}`)
  return data?.results?.[0] ?? null
}

/* --------------------------- Aggregates -------------------------- */

/** Species counts for a query — the backbone of the statistics page. */
export async function fetchSpeciesCounts(
  query: ObservationQuery,
  perPage = 40,
): Promise<SpeciesCount[]> {
  const params: Record<string, unknown> = {
    photos: true,
    quality_grade: 'research',
    per_page: perPage,
    ...query,
  }
  const data = await getJSON<iNatResponse<SpeciesCount>>(
    `/observations/species_counts${qs({ ...params, hierarchy: 'rank' })}`,
    1000 * 60 * 15,
  )
  return data?.results ?? []
}

/** Top observers for a query. */
export async function fetchObservers(
  query: ObservationQuery,
  perPage = 20,
): Promise<ObserverCount[]> {
  const params: Record<string, unknown> = {
    photos: true,
    quality_grade: 'research',
    per_page: perPage,
    ...query,
  }
  const data = await getJSON<iNatResponse<ObserverCount>>(
    `/observations/observers${qs(params)}`,
    1000 * 60 * 15,
  )
  return data?.results ?? []
}

/**
 * Fetch a compact set of observation points (lat/lng + basic taxon info) for
 * mapping. We ask only for the fields the map needs to stay light.
 */
export async function fetchObservationPoints(
  query: ObservationQuery,
  perPage = 200,
): Promise<Observation[]> {
  const params: Record<string, unknown> = {
    photos: true,
    quality_grade: 'research',
    per_page: perPage,
    order_by: 'observed_on',
    order: 'desc',
    m1: '12', // include month-of-year for the time slider
    ...query,
  }
  const data = await getJSON<iNatResponse<Observation>>(
    `/observations${qs(params)}`,
    1000 * 60 * 10,
  )
  return data?.results ?? []
}

/* --------------------- Global / featured stats ------------------- */

/** Headline figures for the landing hero, e.g. total observations. */
export async function fetchGlobalStats(): Promise<{
  observations: number
  species: number
  observers: number
  places: number
} | null> {
  // A cheap way to get a total count: query with per_page=1 and read the
  // total_results envelope. We parallelize a few representative queries.
  const [obs, species, observers] = await Promise.all([
    getJSON<iNatResponse<Observation>>(
      `/observations${qs({ photos: true, quality_grade: 'research', per_page: 1 })}`,
      1000 * 60 * 30,
    ),
    getJSON<iNatResponse<SpeciesCount>>(
      `/observations/species_counts${qs({ photos: true, quality_grade: 'research', per_page: 1, hierarchy: 'rank' })}`,
      1000 * 60 * 30,
    ),
    getJSON<iNatResponse<ObserverCount>>(
      `/observations/observers${qs({ photos: true, quality_grade: 'research', per_page: 1 })}`,
      1000 * 60 * 30,
    ),
  ])
  if (!obs) return null
  return {
    observations: obs.total_results ?? 0,
    species: species?.total_results ?? 0,
    observers: observers?.total_results ?? 0,
    places: 0, // not cheaply available; leave for later
  }
}

export { qs }
