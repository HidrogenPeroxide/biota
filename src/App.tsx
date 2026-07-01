import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
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

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
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
        <Route path="/species/:id" element={<Navigate to="/life-data/species/:id" replace />} />

        <Route path="*" element={lazied(<NotFound />)} />
      </Routes>
      {/* The home page is an immersive full-screen deck — no footer there. */}
      {location.pathname !== '/' && <Footer />}
    </div>
  )
}
