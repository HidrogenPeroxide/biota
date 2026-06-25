/**
 * Higher-level data hooks composing the raw iNaturalist client into the
 * shapes the pages need. Each hook returns loading/data/refetch so pages can
 * render skeletons and graceful fallbacks.
 */

import { useAsync } from './useAsync'
import {
  fetchGlobalStats,
  fetchObservations,
  fetchObservers,
  fetchSpeciesCounts,
  type ObservationQuery,
} from '@/api/inaturalist'
import { photoUrl, pickPhoto } from '@/lib/photos'
import type { HeroSlide } from '@/components/shared/HeroSlideshow'
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

/**
 * Curated hero imagery: the most-celebrated research-grade observations across
 * a few charismatic groups. Each becomes a slow Ken-Burns slide.
 */
export function useHeroSlides() {
  return useAsync(async () => {
    // Pull highly-faved observations from a spread of groups so the hero
    // rotates through mammals, birds, insects, plants, etc.
    const groups = ['Aves', 'Mammalia', 'Insecta', 'Plantae', 'Reptilia']
    const results = await Promise.all(
      groups.map((iconic) =>
        fetchObservations({
          iconic_taxa: iconic,
          order_by: 'votes',
          order: 'desc',
          per_page: 4,
        }).catch(() => []),
      ),
    )
    const flat = results.flat()
    const slides: HeroSlide[] = flat
      .filter((o) => o.photos?.[0] && o.taxon)
      .slice(0, 7)
      .map((o) => ({
        url:
          photoUrl(pickPhoto(o.photos?.[0], 'large'), 'large') ||
          pickPhoto(o.photos?.[0], 'large') ||
          '',
        // Credit is composed in the component (localized), so we stash the raw
        // observer name here; the component renders the localized template.
        credit: o.user?.name || o.user?.login || '',
        observer: o.user?.name || o.user?.login || '',
        caption: o.taxon?.preferred_common_name || o.taxon?.name || '',
        common: o.taxon?.preferred_common_name || undefined,
        scientific: o.taxon?.name,
      }))
      .filter((s) => s.url)

    return slides
  }, [])
}

/** Featured species — the most-observed species within a query. */
export function useFeaturedSpecies(query: ObservationQuery, perPage = 12) {
  return useAsync(
    () => fetchSpeciesCounts(query, perPage),
    [JSON.stringify(query), perPage],
  )
}

/** Top contributors for a query (statistics page). */
export function useTopObservers(query: ObservationQuery, perPage = 10) {
  return useAsync(
    () => fetchObservers(query, perPage),
    [JSON.stringify(query), perPage],
  )
}

/** A gallery of recent/popular observations (species detail + landing). */
export function useObservationGallery(query: ObservationQuery, perPage = 18) {
  return useAsync(
    () =>
      fetchObservations({
        ...query,
        order_by: 'votes',
        order: 'desc',
        per_page: perPage,
      }),
    [JSON.stringify(query), perPage],
  )
}
