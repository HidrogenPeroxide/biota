import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import type { Journey } from '@/data/journeys'
import type { Lang } from '@/i18n'
import { sleep } from '@/lib/utils'

/* Cesium is loaded from the CDN (see index.html) as a global to avoid
 * bundling its workers/assets into the Vite build. */
type CesiumNS = any
declare global {
  interface Window {
    Cesium?: CesiumNS
    CESIUM_BASE_URL?: string
  }
}

export interface JourneyMedia {
  cover: string | null
  speciesCount: number
}

interface JourneyMapProps {
  journeys: Journey[]
  media: Record<string, JourneyMedia>
  selectedSlug?: string | null
  onSelect: (j: Journey) => void
  lang: Lang
  className?: string
}

type Phase = 'idle' | 'playing' | 'done'
type Pt = [number, number]

const PLAYED_KEY = 'biota-journey-played'
const INITIAL_PAUSE = 900
const ROUTE_COLOR = '#b89a5a'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Catmull-Rom → smooth curve through every stop (latitude/longitude space). */
function catmull(p0: Pt, p1: Pt, p2: Pt, p3: Pt, perSeg: number): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i <= perSeg; i++) {
    const t = i / perSeg
    const t2 = t * t
    const t3 = t2 * t
    out.push([
      0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
    ])
  }
  return out
}
function buildSegments(stops: Pt[], perSeg = 28): Pt[][] {
  const ext = [stops[0], ...stops, stops[stops.length - 1]]
  const segs: Pt[][] = []
  for (let i = 0; i < stops.length - 1; i++) {
    segs.push(catmull(ext[i], ext[i + 1], ext[i + 2], ext[i + 3], perSeg))
  }
  return segs
}

/** One cached canvas: a soft glowing point (radial halo + bright core). */
let glowDot: HTMLCanvasElement | null = null
function glowDotCanvas(): HTMLCanvasElement {
  if (glowDot) return glowDot
  const S = 64
  const dpr = 2
  const c = document.createElement('canvas')
  c.width = S * dpr
  c.height = S * dpr
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,253,246,0.95)')
  g.addColorStop(0.18, 'rgba(240,200,120,0.8)')
  g.addColorStop(0.45, 'rgba(200,155,75,0.32)')
  g.addColorStop(1, 'rgba(200,155,75,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  ctx.beginPath()
  ctx.arc(32, 32, 7, 0, Math.PI * 2)
  ctx.fillStyle = '#fff6e2'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255,250,235,0.9)'
  ctx.stroke()
  glowDot = c
  return c
}

/** Resolve once the CDN Cesium global is available. */
function useCesiumReady() {
  const [ready, setReady] = useState<boolean>(
    typeof window !== 'undefined' && !!window.Cesium,
  )
  useEffect(() => {
    if (ready) return
    let id: ReturnType<typeof setTimeout>
    const check = () => {
      if (window.Cesium) {
        setReady(true)
        return
      }
      id = setTimeout(check, 150)
    }
    check()
    return () => clearTimeout(id)
  }, [ready])
  return ready
}

/**
 * Cinematic 3D expedition globe (CesiumJS). Quiet glowing points mark each
 * day; a minimal "Day + Location" chapter label appears only over the hovered
 * or selected point. On entering the viewport it plays once per session: a
 * flight from space → the region, then the golden route draws itself stop by
 * stop as the camera arcs to each chapter.
 */
export function JourneyMap({
  journeys,
  media,
  selectedSlug,
  onSelect,
  lang,
  className,
}: JourneyMapProps) {
  const cesiumReady = useCesiumReady()
  const wrapRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const labelPosRef = useRef<HTMLDivElement>(null)

  const viewerRef = useRef<any>(null)
  const lineCollectionRef = useRef<any>(null)
  const routeLineRef = useRef<any>(null)
  const segCartRef = useRef<any[][]>([])
  const revealedRef = useRef<any[]>([])
  const markersRef = useRef<Map<string, any>>(new Map())
  const markerCartRef = useRef<Map<string, any>>(new Map())
  const rafsRef = useRef<number[]>([])
  const labelRafRef = useRef<number | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const handlerRef = useRef<any>(null)
  const pulseListenerRef = useRef<((t: number) => void) | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const selectedRef = useRef<string | null>(selectedSlug ?? null)
  selectedRef.current = selectedSlug ?? null
  const hoverRef = useRef<string | null>(null)
  const introFocusRef = useRef<string | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const labelSlugRef = useRef<string | null>(null)
  const playedRef = useRef<boolean>(
    typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(PLAYED_KEY) === '1',
  )

  const segments = useMemo(
    () => buildSegments(journeys.map((j) => j.coords)),
    [journeys],
  )

  const [phase, setPhase] = useState<Phase>('idle')
  const [labelSlug, setLabelSlug] = useState<string | null>(null)
  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }
  const inView = useInView(wrapRef, { once: true, amount: 0.3 })

  /** Which stop the label should follow right now. */
  const computeLabelSlug = (): string | null => {
    if (phaseRef.current === 'playing') return introFocusRef.current
    if (phaseRef.current === 'done')
      return hoverRef.current ?? selectedRef.current ?? null
    return null
  }
  const syncLabel = () => {
    const next = computeLabelSlug()
    if (next !== labelSlugRef.current) {
      labelSlugRef.current = next
      setLabelSlug(next)
    }
  }

  const cancelAllAnim = () => {
    rafsRef.current.forEach((id) => cancelAnimationFrame(id))
    rafsRef.current = []
    timersRef.current.forEach((id) => clearTimeout(id))
    timersRef.current = []
  }

  /* ----------------------------- globe init ----------------------------- */
  useEffect(() => {
    if (!cesiumReady || !containerRef.current || viewerRef.current) return
    const C = window.Cesium!

    const viewer = new C.Viewer(containerRef.current, {
      baseLayer: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      creditContainer: document.createElement('div'),
      contextOptions: { webgl: { alpha: true } },
    })
    viewerRef.current = viewer

    viewer.imageryLayers.addImageryProvider(
      new C.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 17,
        credit: 'Imagery © Esri',
      }),
    )

    viewer.scene.backgroundColor = C.Color.fromCssColorString('#080b09')
    viewer.scene.skyBox.show = false
    viewer.scene.sun.show = false
    viewer.scene.moon.show = false
    viewer.scene.skyAtmosphere.show = true
    viewer.scene.skyAtmosphere.hueShift = -0.4
    viewer.scene.skyAtmosphere.saturationShift = -0.2
    viewer.scene.fog.enabled = true
    viewer.scene.fog.density = 0.00015
    viewer.scene.globe.showGroundAtmosphere = true
    viewer.scene.globe.baseColor = C.Color.fromCssColorString('#101613')
    viewer.scene.screenSpaceCameraController.enabled = false

    segCartRef.current = segments.map((seg) =>
      seg.map(([lat, lng]) => C.Cartesian3.fromDegrees(lng, lat)),
    )

    // Golden route, always on top (depth test disabled).
    lineCollectionRef.current = viewer.scene.primitives.add(
      new C.PolylineCollection(),
    )
    routeLineRef.current = lineCollectionRef.current.add({
      positions: [],
      width: 5,
      material: C.Material.fromType('PolylineGlow', {
        color: C.Color.fromCssColorString(ROUTE_COLOR),
        glowPower: 0.22,
      }),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    })

    // Interaction.
    const handler = new C.ScreenSpaceEventHandler(viewer.scene.canvas)
    handlerRef.current = handler
    handler.setInputAction((movement: any) => {
      if (phaseRef.current !== 'done') return
      const picked = viewer.scene.pick(movement.endPosition)
      const slug =
        picked && picked.id && markersRef.current.has(picked.id.id)
          ? picked.id.id
          : null
      hoverRef.current = slug
      containerRef.current!.style.cursor = slug ? 'pointer' : 'default'
      markersRef.current.forEach((ent, s) =>
        applyMarkerScale(ent, s === selectedRef.current, s === slug),
      )
      syncLabel()
    }, C.ScreenSpaceEventType.MOUSE_MOVE)
    handler.setInputAction((click: any) => {
      if (phaseRef.current !== 'done') return
      const picked = viewer.scene.pick(click.position)
      if (!picked || !picked.id) return
      const slug = picked.id.id
      const journey = journeys.find((j) => j.slug === slug)
      if (!journey) return
      viewer.camera.flyTo({
        destination: focusDestination(
          C,
          journey.coords[1],
          journey.coords[0],
          0,
          -38,
          420000,
        ),
        orientation: { heading: 0, pitch: C.Math.toRadians(-38), roll: 0 },
        duration: 1.8,
        easingFunction: C.EasingFunction?.QUARTIC_IN_OUT,
      })
      onSelectRef.current(journey)
    }, C.ScreenSpaceEventType.LEFT_CLICK)

    // Per-frame: project the active label's 3D point to screen space.
    const positionLabel = () => {
      const node = labelPosRef.current
      const slug = labelSlugRef.current
      if (!node) {
        labelRafRef.current = requestAnimationFrame(positionLabel)
        return
      }
      const cart = slug ? markerCartRef.current.get(slug) : null
      if (slug && cart) {
        const p = viewer.scene.cartesianToCanvasCoordinates(cart)
        if (p && p.x > 0 && p.y > 0) {
          node.style.display = 'block'
          node.style.transform = `translate(calc(${p.x}px - 50%), calc(${p.y}px - 140%))`
        } else {
          node.style.display = 'none'
        }
      } else {
        node.style.display = 'none'
      }
      labelRafRef.current = requestAnimationFrame(positionLabel)
    }
    labelRafRef.current = requestAnimationFrame(positionLabel)

    return () => {
      cancelAllAnim()
      if (labelRafRef.current) cancelAnimationFrame(labelRafRef.current)
      labelRafRef.current = null
      handler.destroy()
      handlerRef.current = null
      if (pulseListenerRef.current && viewerRef.current) {
        viewerRef.current.scene.preRender.removeListener(pulseListenerRef.current)
        pulseListenerRef.current = null
      }
      viewer.destroy()
      viewerRef.current = null
      markersRef.current.clear()
      markerCartRef.current.clear()
    }
  }, [cesiumReady, segments, journeys])

  /* ----------------------------- markers ----------------------------- */
  const BASE_SCALE = 0.5
  function applyMarkerScale(ent: any, active: boolean, hover: boolean) {
    if (!ent.billboard) return
    const base = active ? 0.66 : BASE_SCALE
    ent.billboard.scale = hover ? base + 0.08 : base
  }

  function revealMarker(j: Journey) {
    const viewer = viewerRef.current
    const C = window.Cesium
    if (!viewer || !C) return
    if (markersRef.current.has(j.slug)) return
    const cart = C.Cartesian3.fromDegrees(j.coords[1], j.coords[0])
    markerCartRef.current.set(j.slug, cart)
    const ent = viewer.entities.add({
      id: j.slug,
      position: cart,
      billboard: {
        image: glowDotCanvas(),
        scale: 0,
        verticalOrigin: C.VerticalOrigin.CENTER,
        heightReference: C.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new C.NearFarScalar(5e5, 1, 3e7, 0.4),
        translucencyByDistance: new C.NearFarScalar(6e5, 1, 4e7, 0.3),
      },
    })
    markersRef.current.set(j.slug, ent)

    // Gentle rise: scale 0 → base.
    const start = performance.now()
    const grow = () => {
      const t = Math.min(1, (performance.now() - start) / 700)
      ent.billboard.scale = BASE_SCALE * easeInOutCubic(t)
      if (t < 1) rafsRef.current.push(requestAnimationFrame(grow))
    }
    rafsRef.current.push(requestAnimationFrame(grow))
  }

  /* ----------------------------- route drawing ----------------------------- */
  /** Reveal one curved segment progressively. The camera is flown separately
   *  (per-stop flyTo) so the route drawing and camera stay in loose sync. */
  function drawSegment(segCart: any[], durMs: number) {
    return new Promise<void>((resolve) => {
      const base = revealedRef.current.slice()
      const n = segCart.length
      const start = performance.now()
      const paint = () => {
        const t = Math.min(1, (performance.now() - start) / durMs)
        const e = easeInOutCubic(t)
        const idx = Math.max(1, Math.min(n - 1, Math.round(e * (n - 1))))
        revealedRef.current = base.concat(segCart.slice(1, idx + 1))
        if (routeLineRef.current) {
          routeLineRef.current.positions = revealedRef.current.slice()
        }
        if (t < 1) rafsRef.current.push(requestAnimationFrame(paint))
        else resolve()
      }
      rafsRef.current.push(requestAnimationFrame(paint))
    })
  }

  /* ----------------------------- camera + intro ----------------------------- */
  function focusDestination(
    C: CesiumNS,
    lng: number,
    lat: number,
    headingDeg: number,
    pitchDeg: number,
    range: number,
  ) {
    const target = C.Cartesian3.fromDegrees(lng, lat)
    const enu = C.Transforms.eastNorthUpToFixedFrame(target)
    const heading = C.Math.toRadians(headingDeg)
    const pitch = C.Math.toRadians(pitchDeg)
    const east = -Math.sin(heading) * Math.cos(pitch) * range
    const north = -Math.cos(heading) * Math.cos(pitch) * range
    const up = -Math.sin(pitch) * range
    const dest = new C.Cartesian3()
    C.Matrix4.multiplyByPoint(enu, new C.Cartesian3(east, north, up), dest)
    return dest
  }
  function segDuration(a: Pt, b: Pt): number {
    const C = window.Cesium
    const d = C.Cartesian3.distance(
      C.Cartesian3.fromDegrees(a[1], a[0]),
      C.Cartesian3.fromDegrees(b[1], b[0]),
    )
    return Math.min(3.8, Math.max(1.8, d / 1_100_000))
  }
  function stopHeight(j: Journey): number {
    return j.elevation ? 240000 : 340000
  }

  /**
   * Glide the camera from one point to another while interpolating its
   * altitude between `startRange` and `endRange` — altitude is fully under
   * our control (no Cesium flyTo arc), so station-to-station movement never
   * rises above the higher of the two stop heights.
   */
  function flyBetween(
    from: Pt,
    to: Pt,
    startRange: number,
    endRange: number,
    pitchDeg: number,
    durSec: number,
  ) {
    return new Promise<void>((resolve) => {
      const viewer = viewerRef.current
      const C = window.Cesium
      if (!viewer || !C) return resolve()
      const pitch = C.Math.toRadians(pitchDeg)
      const start = performance.now()
      const dur = durSec * 1000
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / dur)
        const e = easeInOutCubic(t)
        const lat = from[0] + (to[0] - from[0]) * e
        const lng = from[1] + (to[1] - from[1]) * e
        const range = startRange + (endRange - startRange) * e
        viewer.camera.lookAt(
          C.Cartesian3.fromDegrees(lng, lat),
          new C.HeadingPitchRange(0, pitch, range),
        )
        if (t < 1) rafsRef.current.push(requestAnimationFrame(tick))
        else resolve()
      }
      rafsRef.current.push(requestAnimationFrame(tick))
    })
  }

  function focusStop(slug: string) {
    introFocusRef.current = slug
    syncLabel()
  }

  async function playIntro() {
    const viewer = viewerRef.current
    const C = window.Cesium
    if (!viewer || !C) return
    setPhaseBoth('playing')

    // Establishing shot from on high, looking toward East Asia.
    viewer.camera.setView({
      destination: C.Cartesian3.fromDegrees(104, 18, 6_000_000),
      orientation: { heading: 0, pitch: C.Math.toRadians(-20), roll: 0 },
    })
    await sleep(INITIAL_PAUSE)
    if (phaseRef.current !== 'playing') return

    const stops = journeys
    revealMarker(stops[0])
    focusStop(stops[0].slug)

    // Descend onto the first chapter (high start → low stop height).
    await flyBetween(
      [18, 104],
      stops[0].coords,
      6_000_000,
      stopHeight(stops[0]),
      -42,
      3.4,
    )
    if (phaseRef.current !== 'playing') return

    // Station-to-station: each leg glides at the (low) stop heights, so the
    // camera never climbs high between chapters. The route draws in parallel.
    for (let i = 0; i < segments.length; i++) {
      const a = stops[i].coords
      const b = stops[i + 1].coords
      const dur = segDuration(a, b)
      await Promise.all([
        flyBetween(
          a,
          b,
          stopHeight(stops[i]),
          stopHeight(stops[i + 1]),
          -42,
          dur,
        ),
        drawSegment(segCartRef.current[i], dur * 1000),
      ])
      if (phaseRef.current !== 'playing') return
      revealMarker(stops[i + 1])
      focusStop(stops[i + 1].slug)
      await sleep(900)
      if (phaseRef.current !== 'playing') return
    }

    finalize()
  }

  function finalize() {
    const viewer = viewerRef.current
    const C = window.Cesium
    if (!viewer || !C) return

    revealedRef.current = segCartRef.current.flat()
    if (routeLineRef.current) {
      routeLineRef.current.positions = revealedRef.current.slice()
    }
    journeys.forEach((j) => revealMarker(j))

    viewer.scene.screenSpaceCameraController.enabled = true
    startSelectedPulse(C, viewer)

    // Release the lookAt lock used during the glide so the overview flight
    // and subsequent free interaction behave normally.
    viewer.camera.lookAtTransform(C.Matrix4.IDENTITY)

    viewer.flyTo(viewer.entities.values, {
      offset: new C.HeadingPitchRange(0, C.Math.toRadians(-32), 3_200_000),
      duration: 3,
    })

    introFocusRef.current = null
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(PLAYED_KEY, '1')
    setPhaseBoth('done')
    syncLabel()
  }

  function startSelectedPulse(C: CesiumNS, viewer: any) {
    if (pulseListenerRef.current) {
      viewer.scene.preRender.removeListener(pulseListenerRef.current)
    }
    const t0 = performance.now()
    const fn = () => {
      const t = (performance.now() - t0) / 1000
      const slug = selectedRef.current
      const ent = slug ? markersRef.current.get(slug) : null
      if (ent && ent.billboard) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6)
        ent.billboard.scale = 0.66 + pulse * 0.05
      }
    }
    pulseListenerRef.current = fn
    viewer.scene.preRender.addEventListener(fn)
  }

  /* ------------------------- trigger / sync ------------------------ */
  useEffect(() => {
    if (!inView || !viewerRef.current) return
    if (playedRef.current) finalize()
    else if (phaseRef.current === 'idle') playIntro()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  useEffect(() => {
    if (phaseRef.current === 'done') syncLabel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug, phase])

  function handleReplay() {
    cancelAllAnim()
    const viewer = viewerRef.current
    if (!viewer) return
    revealedRef.current = []
    if (routeLineRef.current) routeLineRef.current.positions = []
    markersRef.current.forEach((ent) => viewer.entities.remove(ent))
    markersRef.current.clear()
    markerCartRef.current.clear()
    viewer.scene.screenSpaceCameraController.enabled = false
    sessionStorage.removeItem(PLAYED_KEY)
    playedRef.current = false
    setPhaseBoth('idle')
    timersRef.current.push(setTimeout(() => playIntro(), 60))
  }
  function handleSkip() {
    cancelAllAnim()
    finalize()
  }

  const labelJourney = labelSlug ? journeys.find((j) => j.slug === labelSlug) : null

  return (
    <div ref={wrapRef} className={`journey-globe relative ${className ?? ''}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {!cesiumReady && (
        <div className="shimmer absolute inset-0 bg-forest-deep" aria-hidden />
      )}
      <div className="journey-vignette pointer-events-none absolute inset-0" />
      <div className="journey-grade pointer-events-none absolute inset-0" />

      {/* Minimal chapter label — tracks the active point each frame. */}
      <div
        ref={labelPosRef}
        className="pointer-events-none absolute left-0 top-0 z-[600]"
        style={{ display: 'none' }}
      >
        <AnimatePresence>
          {labelJourney && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="expedition-label"
            >
              <div className="expedition-label__day">
                {lang === 'zh'
                  ? `第 ${labelJourney.day} 天`
                  : `Day ${labelJourney.day}`}
              </div>
              <div className="expedition-label__name">
                {labelJourney.location[lang]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'playing' && (
        <button
          onClick={handleSkip}
          className="absolute bottom-4 right-4 z-[700] rounded-full border border-ivory-50/20 bg-charcoal/55 px-4 py-1.5 text-[11px] font-medium tracking-wide text-ivory-50/85 backdrop-blur-md transition-colors hover:bg-charcoal/80 hover:text-ivory-50"
        >
          {lang === 'zh' ? '跳过开场 ›' : 'Skip intro ›'}
        </button>
      )}
      {phase === 'done' && (
        <button
          onClick={handleReplay}
          className="absolute bottom-4 right-4 z-[700] flex items-center gap-1.5 rounded-full border border-ivory-50/15 bg-charcoal/45 px-4 py-1.5 text-[11px] font-medium tracking-wide text-ivory-50/70 backdrop-blur-md transition-colors hover:bg-charcoal/70 hover:text-ivory-50"
        >
          <span className="h-3 w-3 rounded-full border border-ivory-50/50" />
          {lang === 'zh' ? '重播旅程' : 'Replay journey'}
        </button>
      )}
    </div>
  )
}
