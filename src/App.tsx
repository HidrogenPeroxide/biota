import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef } from 'react'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { FieldNote } from '@/components/easter-egg/FieldNote'
import { fieldNoteStore } from '@/lib/fieldNoteStore'
import { journeyReset } from '@/lib/journeyReset'
import { Landing } from '@/pages/Landing'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-load the heavier routes so the landing page stays light and the
// charting (D3) / mapping (Leaflet) bundles only load when needed.
const Explore = lazy(() =>
  import('@/pages/Explore').then((m) => ({ default: m.Explore })),
)
const SpeciesDetail = lazy(() =>
  import('@/pages/SpeciesDetail').then((m) => ({ default: m.SpeciesDetail })),
)
const Statistics = lazy(() =>
  import('@/pages/Statistics').then((m) => ({ default: m.Statistics })),
)
const MapExplore = lazy(() =>
  import('@/pages/MapExplore').then((m) => ({ default: m.MapExplore })),
)
const JourneyDetail = lazy(() =>
  import('@/pages/JourneyDetail').then((m) => ({ default: m.JourneyDetail })),
)
const LifeDataHub = lazy(() =>
  import('@/pages/LifeDataHub').then((m) => ({ default: m.LifeDataHub })),
)
const About = lazy(() =>
  import('@/pages/About').then((m) => ({ default: m.About })),
)
const NotFound = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFound })),
)

function RouteFallback() {
  return (
    <div className="pt-[72px]">
      <Skeleton className="h-[60vh] w-full rounded-none" />
    </div>
  )
}

const lazied = (el: React.ReactElement) => (
  <Suspense fallback={<RouteFallback />}>{el}</Suspense>
)

export default function App() {
  const location = useLocation()

  /* ---- Hidden field-note discovery tracking (quiet, never advertised) ---- */
  const speciesSeen = useRef(new Set<string>())
  const sectionsSeen = useRef(new Set<string>())
  useEffect(() => {
    const p = location.pathname
    // #003 Field Naturalist — open several different species pages
    if (p.startsWith('/life-data/species/')) {
      speciesSeen.current.add(p)
      if (speciesSeen.current.size >= 5) fieldNoteStore.discover('003')
    }
    // #004 Hidden Trail — visit Home → Journey → Life Data → About
    const sec =
      p === '/'
        ? 'home'
        : p.startsWith('/journey/')
          ? 'journey'
          : p.startsWith('/life-data')
            ? 'lifedata'
            : p === '/about'
              ? 'about'
              : null
    if (sec) {
      sectionsSeen.current.add(sec)
      if (sectionsSeen.current.size >= 4) fieldNoteStore.discover('004')
    }
  }, [location.pathname])

  // #002 Patient Observer — stay quietly on a journey page for a while
  useEffect(() => {
    if (!location.pathname.startsWith('/journey/')) return
    let timer = window.setTimeout(() => fieldNoteStore.discover('002'), 40000)
    const reset = () => {
      clearTimeout(timer)
      timer = window.setTimeout(() => fieldNoteStore.discover('002'), 40000)
    }
    const evts = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']
    evts.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      clearTimeout(timer)
      evts.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [location.pathname])

  // Dev-only: Cmd/Ctrl+Shift+E reveals every field note; Shift+R clears them.
  useEffect(() => {
    if (!(import.meta as { env?: { DEV?: boolean } }).env?.DEV) return
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return
      const k = e.key.toLowerCase()
      if (k === 'e') {
        e.preventDefault()
        ;(['001', '002', '003', '004'] as const).forEach((id) =>
          fieldNoteStore.discover(id),
        )
      } else if (k === 'r') {
        e.preventDefault()
        fieldNoteStore.clear()
        journeyReset.trigger()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-ivory">
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Story-driven home */}
        <Route path="/" element={<Landing />} />
        <Route path="/journey/:slug" element={lazied(<JourneyDetail />)} />

        {/* Life Data — the scientific exploration section */}
        <Route path="/life-data" element={lazied(<LifeDataHub />)} />
        <Route path="/life-data/explore" element={lazied(<Explore />)} />
        <Route path="/life-data/map" element={lazied(<MapExplore />)} />
        <Route path="/life-data/stats" element={lazied(<Statistics />)} />
        <Route path="/life-data/species/:id" element={lazied(<SpeciesDetail />)} />

        {/* About */}
        <Route path="/about" element={lazied(<About />)} />

        {/* Back-compat redirects for the old flat routes */}
        <Route path="/explore" element={<Navigate to="/life-data/explore" replace />} />
        <Route path="/map" element={<Navigate to="/life-data/map" replace />} />
        <Route path="/statistics" element={<Navigate to="/life-data/stats" replace />} />
        <Route path="/species/:id" element={<LegacySpeciesRedirect />} />

        <Route path="*" element={lazied(<NotFound />)} />
      </Routes>
      {/* The home page is an immersive full-screen deck — no footer there. */}
      {location.pathname !== '/' && <Footer />}
      {/* Hidden easter egg — revealed by double-clicking the logo. */}
      <FieldNote />
    </div>
  )
}

/** Carry the id over for the legacy /species/:id → /life-data/species/:id. */
function LegacySpeciesRedirect() {
  const { id } = useParams()
  return <Navigate to={`/life-data/species/${id}`} replace />
}
