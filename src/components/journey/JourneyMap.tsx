import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Journey } from '@/data/journeys'
import type { Lang } from '@/i18n'

export interface JourneyMedia {
  cover: string | null
  speciesCount: number
}

interface JourneyMapProps {
  journeys: Journey[]
  /** slug → live cover photo + species count (fetched in the parent). */
  media: Record<string, JourneyMedia>
  selectedSlug?: string | null
  onSelect: (j: Journey) => void
  lang: Lang
  className?: string
}

/**
 * The homepage's centerpiece: an interactive map of the expedition, NOT an
 * observation map. Each marker is one day / one chapter of the journey on a
 * dark, stylized Earth. Hovering shows a preview card; clicking flies the
 * camera in and selects the chapter.
 */
export function JourneyMap({
  journeys,
  media,
  selectedSlug,
  onSelect,
  lang,
  className,
}: JourneyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // --- Init once ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [33, 105],
      zoom: 3,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
      preferCanvas: false,
    })
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Dark stylized Earth base.
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      },
    ).addTo(map)

    mapRef.current = map
    // Leaflet sometimes mis-sizes before the container is laid out.
    setTimeout(() => map.invalidateSize(), 60)

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // --- Route line connecting all chapters (gently animated dashes) ---
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const route = L.polyline(
      journeys.map((j) => j.coords),
      {
        color: '#b8893a',
        weight: 2,
        opacity: 0.55,
        className: 'journey-route',
        lineCap: 'round',
      },
    ).addTo(map)
    return () => {
      route.remove()
    }
  }, [journeys])

  // --- Markers + hover tooltips ---
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear previous markers.
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    journeys.forEach((j) => {
      const m = media[j.slug]
      const cover = m?.cover
      const count = m?.speciesCount ?? 0
      const marker = L.marker(j.coords, {
        icon: L.divIcon({
          className: 'journey-marker',
          html: `<div class="journey-marker__pin">${j.day}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
        zIndexOffset: j.slug === selectedSlug ? 1000 : 0,
      }).addTo(map)

      const tooltipHtml = `
        <div class="journey-tooltip__body">
          <div class="journey-tooltip__day">${lang === 'zh' ? '第 ' + j.day + ' 天' : 'Day ' + j.day}</div>
          <div class="journey-tooltip__name">${j.location[lang]}</div>
          <div class="journey-tooltip__meta">${j.date}${count ? ' · ' + count + (lang === 'zh' ? ' 物种' : ' species') : ''}</div>
        </div>
      `
      marker.bindTooltip(
        cover
          ? `<img class="journey-tooltip__img" src="${cover}" alt=""/>` + tooltipHtml
          : tooltipHtml,
        {
          className: 'journey-tooltip',
          direction: 'top',
          offset: [0, -14],
          opacity: 1,
        },
      )

      marker.on('click', () => {
        map.flyTo(j.coords, 7, { duration: 1.6, easeLinearity: 0.25 })
        onSelectRef.current(j)
      })

      markersRef.current.set(j.slug, marker)
    })

    // Frame the whole route once on first render.
    if (journeys.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(journeys.map((j) => j.coords)), {
          padding: [60, 60],
          animate: true,
          duration: 1.2,
        })
      } catch {
        /* bounds may not be ready */
      }
    }
  }, [journeys, media, lang, selectedSlug])

  // --- Highlight the active marker + fly to selection changes ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedSlug) return
    const j = journeys.find((x) => x.slug === selectedSlug)
    if (!j) return
    const marker = markersRef.current.get(selectedSlug)
    marker?.openTooltip()
    map.flyTo(j.coords, 7, { duration: 1.6, easeLinearity: 0.25 })
  }, [selectedSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className={`journey-map ${className ?? ''}`} />
}
