import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'

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

export default function App() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <ScrollToTop />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/explore"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Explore />
              </Suspense>
            }
          />
          <Route
            path="/species/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <SpeciesDetail />
              </Suspense>
            }
          />
          <Route
            path="/statistics"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Statistics />
              </Suspense>
            }
          />
          <Route
            path="/map"
            element={
              <Suspense fallback={<RouteFallback />}>
                <MapExplore />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
