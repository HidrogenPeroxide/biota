/**
 * Higher-level data hooks composing the raw iNaturalist client into the
 * shapes the pages need. Each hook returns loading/data/refetch so pages can
 * render skeletons and graceful fallbacks.
 */

import { useAsync } from './useAsync'
import { fetchGlobalStats, fetchSpeciesCounts, type ObservationQuery } from '@/api/inaturalist'
import { FALLBACK_STATS } from '@/data/taxonomy'

/** Headline global figures for the landing hero. */
export function useGlobalStats() {
  return useAsync(async () => {
    const stats = await fetchGlobalStats()
    // Merge live data over conservative fallbacks so the UI always renders.
    return {
      observations: stats?.observations ?? FALLBACK_STATS.observations,
      species: stats?.species ?? FALLBACK_STATS.species,
      observers: stats?.observers ?? FALLBACK_STATS.observers,
      places: FALLBACK_STATS.places,
      live: stats !== null,
    }
  }, [])
}

/** Featured species — the most-observed species within a query. */
export function useFeaturedSpecies(query: ObservationQuery, perPage = 12) {
  return useAsync(
    () => fetchSpeciesCounts(query, perPage),
    [JSON.stringify(query), perPage],
  )
}
