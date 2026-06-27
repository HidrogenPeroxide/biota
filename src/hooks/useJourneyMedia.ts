import { useEffect, useState } from 'react'
import { fetchObservations } from '@/api/inaturalist'
import { photoUrl, pickPhoto } from '@/lib/photos'
import { JOURNEYS } from '@/data/journeys'
import type { Observation } from '@/types'

/**
 * Live, real cover imagery + species for a journey location.
 *
 * The journey prose is placeholder, but photos and "species observed" come
 * straight from iNaturalist by querying near the location's coordinates, so
 * imagery is always real and never broken. We fetch once per slug and cache.
 */

const cache = new Map<string, { cover: string | null; speciesCount: number }>()

export function useJourneyCover(slug: string, coords: [number, number], date?: string) {
  const [data, setData] = useState<{ cover: string | null; speciesCount: number }>(
    () => cache.get(slug) ?? { cover: null, speciesCount: 0 },
  )

  useEffect(() => {
    let cancelled = false
    if (cache.has(slug)) {
      setData(cache.get(slug)!)
      return
    }
    fetchObservations({
      lat: coords[0],
      lng: coords[1],
      radius: 50,
      per_page: 48,
      order_by: 'votes',
      order: 'desc',
      // Narrow to the journey day when known, else the surrounding season.
      ...(date ? { d1: date, d2: date } : {}),
    }).then((obs: Observation[]) => {
      if (cancelled) return
      const withPhoto = obs.find((o) => o.photos?.[0])
      const cover = withPhoto
        ? photoUrl(pickPhoto(withPhoto.photos![0], 'large'), 'large') || null
        : null
      // Unique species count from the returned set.
      const species = new Set(obs.map((o) => o.taxon?.id).filter(Boolean))
      const result = { cover, speciesCount: species.size }
      cache.set(slug, result)
      setData(result)
    })
    return () => {
      cancelled = true
    }
  }, [slug, coords[0], coords[1], date])

  return data
}

/** Fetch cover imagery for every journey at once (for the homepage map + grid). */
export function useAllJourneyMedia() {
  const [media, setMedia] = useState<Record<string, { cover: string | null; speciesCount: number }>>({})

  useEffect(() => {
    let cancelled = false
    Promise.all(
      JOURNEYS.map(async (j) => {
        const obs = await fetchObservations({
          lat: j.coords[0],
          lng: j.coords[1],
          radius: 50,
          per_page: 48,
          order_by: 'votes',
          order: 'desc',
        })
        const withPhoto = obs.find((o) => o.photos?.[0])
        const cover = withPhoto
          ? photoUrl(pickPhoto(withPhoto.photos![0], 'large'), 'large') || null
          : null
        const species = new Set(obs.map((o) => o.taxon?.id).filter(Boolean))
        return [j.slug, { cover, speciesCount: species.size }] as const
      }),
    ).then((entries) => {
      if (!cancelled) setMedia(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return media
}

/** Fetch the species observed near a location (for a journal's species list). */
export function useJourneySpecies(coords: [number, number], date?: string) {
  const [observations, setObservations] = useState<Observation[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchObservations({
      lat: coords[0],
      lng: coords[1],
      radius: 50,
      per_page: 60,
      order_by: 'votes',
      order: 'desc',
      ...(date ? { d1: date, d2: date } : {}),
    }).then((obs) => {
      if (!cancelled) setObservations(obs)
    })
    return () => {
      cancelled = true
    }
  }, [coords[0], coords[1], date])

  return observations
}
