import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { useInView } from 'framer-motion'
import type { Journey } from '@/data/journeys'
import type { Lang } from '@/i18n'
import { sleep } from '@/lib/utils'

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

type Phase = 'idle' | 'playing' | 'done'

const PLAYED_KEY = 'biota-journey-played'
const SEG_DURATION = 2000 // ms per drawn segment + camera glide
const INITIAL_PAUSE = 900 // ms after the map fades in, before the journey begins
const TRAVEL_ZOOM = 5

/** Cubic ease-in-out for an organic, hand-drawn pace. */
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * The homepage's cinematic expedition sequence.
 *
 * When the section scrolls into view (once per session), the map fades in
 * empty; a warm golden route draws itself segment-by-segment while the camera
 * glides from stop to stop; each destination marker fades in and softly
 * pulses as it is reached. When the journey completes the map unlocks for
 * full interaction — hover reveals a photo preview, click opens the journal
 * preview. Subsequent visits skip the intro and show the finished map.
 */
export function JourneyMap({
  journeys,
  media,
  selectedSlug,
  onSelect,
  lang,
  className,
}: JourneyMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const zoomRef = useRef<L.Control.Zoom | null>(null)
  const glowRef = useRef<L.Polyline | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)
  const drawnRef = useRef<[number, number][]>([])
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const rafsRef = useRef<number[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const phaseRef = useRef<Phase>('idle')
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const mediaRef = useRef(media)
  mediaRef.current = media
  const playedRef = useRef<boolean>(
    typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(PLAYED_KEY) === '1',
  )

  const [phase, setPhase] = useState<Phase>('idle')
  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }
  const inView = useInView(wrapRef, { once: true, amount: 0.35 })

  const cancelAllAnim = () => {
    rafsRef.current.forEach((id) => cancelAnimationFrame(id))
    rafsRef.current = []
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
  }

  /* ----------------------------- map init ----------------------------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [33, 108],
      zoom: 4,
      // Locked during the intro so the camera owns the movement.
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      worldCopyJump: true,
    })

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

    // Warm golden route: a soft glow under a crisp line.
    glowRef.current = L.polyline([], {
      color: '#cda44a',
      weight: 9,
      opacity: 0.16,
      lineCap: 'round',
      className: 'journey-glow',
    }).addTo(map)
    lineRef.current = L.polyline([], {
      color: '#e2b45e',
      weight: 2.5,
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map)

    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 60)

    return () => {
      cancelAllAnim()
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  /* ----------------------------- helpers ----------------------------- */
  function buildMarkerIcon(j: Journey, active: boolean, enter: boolean) {
    return L.divIcon({
      className: 'journey-marker' + (enter ? ' journey-marker--enter' : ''),
      html: `
        <div class="journey-marker__pin ${active ? 'journey-marker__pin--active' : ''}">${j.day}</div>
        <div class="journey-marker__label">
          <span class="journey-marker__label-day">${lang === 'zh' ? '第 ' + j.day + ' 天' : 'Day ' + j.day}</span>
          <span class="journey-marker__label-name">${j.location[lang]}</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  function revealMarker(j: Journey, enter: boolean) {
    const map = mapRef.current
    if (!map) return
    if (markersRef.current.has(j.slug)) return
    const marker = L.marker(j.coords, {
      icon: buildMarkerIcon(j, false, enter),
      zIndexOffset: 0,
    }).addTo(map)
    marker.on('click', () => {
      if (phaseRef.current !== 'done') return
      map.flyTo(j.coords, 6, { duration: 1.2, easeLinearity: 0.25 })
      onSelectRef.current(j)
    })
    markersRef.current.set(j.slug, marker)
  }

  /** Progressively draw one segment a→b over `dur` ms. The camera is driven
   *  from THIS SAME loop (setView per frame to the line tip), so the line and
   *  the camera share one clock and one easing curve — they never drift. */
  function drawSegment(
    a: [number, number],
    b: [number, number],
    dur: number,
    zoom: number,
  ) {
    return new Promise<void>((resolve) => {
      const map = mapRef.current
      const drawn = drawnRef.current
      // Ensure the line ends at `a`, then add a moving point we will animate.
      const last = drawn[drawn.length - 1]
      if (!last || last[0] !== a[0] || last[1] !== a[1]) drawn.push(a)
      drawn.push(a)
      const moveIdx = drawn.length - 1
      const start = performance.now()
      const paint = () => {
        const t = Math.min(1, (performance.now() - start) / dur)
        const e = easeInOutCubic(t)
        const p: [number, number] = [lerp(a[0], b[0], e), lerp(a[1], b[1], e)]
        drawn[moveIdx] = p
        const pts = drawn.slice()
        lineRef.current?.setLatLngs(pts)
        glowRef.current?.setLatLngs(pts)
        // Camera tracks the pen tip — same loop, same easing → in sync.
        map?.setView(p, zoom, { animate: false })
        if (t < 1) {
          rafsRef.current.push(requestAnimationFrame(paint))
        } else {
          drawn[moveIdx] = b
          resolve()
        }
      }
      rafsRef.current.push(requestAnimationFrame(paint))
    })
  }

  /** Final state: full route + every marker, interactive, framed to fit. */
  function finalize() {
    const map = mapRef.current
    if (!map) return
    // Make sure the entire route + all markers are present.
    drawnRef.current = journeys.map((j) => j.coords)
    lineRef.current?.setLatLngs(drawnRef.current)
    glowRef.current?.setLatLngs(drawnRef.current)
    journeys.forEach((j) => revealMarker(j, false))

    // Unlock interaction (keep scroll-wheel zoom off so the page still scrolls).
    map.dragging.enable()
    map.touchZoom.enable()
    map.doubleClickZoom.enable()
    map.boxZoom.enable()
    map.keyboard.enable()
    if (!zoomRef.current) {
      zoomRef.current = L.control.zoom({ position: 'bottomright' })
      zoomRef.current.addTo(map)
    }

    // Bind rich hover previews now that we may have cover imagery.
    bindTooltips()

    try {
      map.flyToBounds(L.latLngBounds(journeys.map((j) => j.coords)), {
        padding: [70, 70],
        duration: 2.2,
        easeLinearity: 0.25,
      })
    } catch {
      /* bounds not ready */
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(PLAYED_KEY, '1')
    }
    setPhaseBoth('done')
  }

  function bindTooltips() {
    const m = mediaRef.current
    markersRef.current.forEach((marker, slug) => {
      const j = journeys.find((x) => x.slug === slug)
      if (!j) return
      const cover = m[slug]?.cover
      const count = m[slug]?.speciesCount ?? 0
      const body = `
        <div class="journey-tooltip__body">
          <div class="journey-tooltip__day">${lang === 'zh' ? '第 ' + j.day + ' 天' : 'Day ' + j.day}</div>
          <div class="journey-tooltip__name">${j.location[lang]}</div>
          <div class="journey-tooltip__meta">${j.date}${count ? ' · ' + count + (lang === 'zh' ? ' 物种' : ' species') : ''}</div>
        </div>`
      marker.bindTooltip(
        cover ? `<img class="journey-tooltip__img" src="${cover}" alt=""/>` + body : body,
        { className: 'journey-tooltip', direction: 'top', offset: [0, -14], opacity: 1 },
      )
    })
  }

  /** The full documentary opening, played once. */
  async function playIntro() {
    const map = mapRef.current
    if (!map) return
    setPhaseBoth('playing')

    await sleep(INITIAL_PAUSE)
    if (phaseRef.current !== 'playing') return // skipped / unmounted

    const stops = journeys
    // Reveal the origin (Beijing) and glide the camera to it. No line is
    // being drawn yet, so a normal flyTo is fine here.
    revealMarker(stops[0], true)
    map.flyTo(stops[0].coords, TRAVEL_ZOOM, { duration: 1.8, easeLinearity: 0.25 })
    await sleep(1900)
    if (phaseRef.current !== 'playing') return

    // Walk each segment: the golden line draws toward the next stop while
    // the camera follows the pen tip in the same loop. Destination reveals
    // once the line reaches it.
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1].coords
      const b = stops[i].coords
      await drawSegment(a, b, SEG_DURATION, TRAVEL_ZOOM)
      if (phaseRef.current !== 'playing') return
      revealMarker(stops[i], true)
      await sleep(520) // a beat to read the new label
      if (phaseRef.current !== 'playing') return
    }

    finalize()
  }

  /* ------------------------- trigger the intro ------------------------ */
  useEffect(() => {
    if (!inView || !mapRef.current) return
    // Already seen this session → show the finished map immediately.
    if (playedRef.current) {
      finalize()
    } else if (phaseRef.current === 'idle') {
      playIntro()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  // Re-bind tooltips when cover imagery arrives after the intro.
  useEffect(() => {
    if (phaseRef.current === 'done') bindTooltips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, lang])

  // Keep the selected marker visually active.
  useEffect(() => {
    markersRef.current.forEach((marker, slug) => {
      const j = journeys.find((x) => x.slug === slug)
      if (j) marker.setIcon(buildMarkerIcon(j, slug === selectedSlug, false))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug, lang, phase])

  function handleReplay() {
    cancelAllAnim()
    // Reset route + markers.
    drawnRef.current = []
    lineRef.current?.setLatLngs([])
    glowRef.current?.setLatLngs([])
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()
    // Remove the zoom control added at finalize (re-added on next finalize).
    if (zoomRef.current && mapRef.current) {
      mapRef.current.removeControl(zoomRef.current)
      zoomRef.current = null
    }
    sessionStorage.removeItem(PLAYED_KEY)
    playedRef.current = false
    setPhaseBoth('idle')
    // Restart after a tick so React flushes.
    timersRef.current.push(setTimeout(() => playIntro(), 60))
  }

  function handleSkip() {
    cancelAllAnim()
    finalize()
  }

  return (
    <div ref={wrapRef} className={`journey-map relative ${className ?? ''}`}>
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      {/* Skip / Replay controls — minimal, editorial */}
      {phase === 'playing' && (
        <button
          onClick={handleSkip}
          className="absolute bottom-4 right-4 z-[700] rounded-full border border-ivory-50/25 bg-charcoal/60 px-4 py-1.5 text-[11px] font-medium tracking-wide text-ivory-50/80 backdrop-blur-md transition-colors hover:bg-charcoal/80 hover:text-ivory-50"
        >
          {lang === 'zh' ? '跳过开场 ›' : 'Skip intro ›'}
        </button>
      )}
      {phase === 'done' && (
        <button
          onClick={handleReplay}
          className="absolute bottom-4 right-4 z-[700] flex items-center gap-1.5 rounded-full border border-ivory-50/20 bg-charcoal/50 px-4 py-1.5 text-[11px] font-medium tracking-wide text-ivory-50/70 backdrop-blur-md transition-colors hover:bg-charcoal/70 hover:text-ivory-50"
        >
          <span className="h-3.5 w-3.5 rounded-full border border-ivory-50/50" />
          {lang === 'zh' ? '重播旅程' : 'Replay journey'}
        </button>
      )}
    </div>
  )
}
