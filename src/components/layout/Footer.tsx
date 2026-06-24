import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-stone-light/60 bg-forest-deep text-ivory-50/80">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory-50/10 text-ivory-50">
              <Leaf className="h-4.5 w-4.5" strokeWidth={1.6} />
            </span>
            <span className="font-display text-lg font-medium text-ivory-50">
              Biota
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory-50/60">
            A living atlas of biodiversity — a digital natural history museum
            built on the open observations of millions of naturalists around
            the world.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-widest-2 text-forest-mist">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/explore" className="link-underline">
                Taxonomy
              </Link>
            </li>
            <li>
              <Link to="/map" className="link-underline">
                Living Atlas Map
              </Link>
            </li>
            <li>
              <Link to="/statistics" className="link-underline">
                Insights
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-xs uppercase tracking-widest-2 text-forest-mist">
            Data & Attribution
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-ivory-50/60">
            All biodiversity data is sourced from the{' '}
            <a
              href="https://www.inaturalist.org"
              target="_blank"
              rel="noreferrer"
              className="link-underline text-ivory-50/90"
            >
              iNaturalist
            </a>{' '}
            public API, a joint initiative of the California Academy of
            Sciences and the National Geographic Society. Photography remains
            the property of the original observers.
          </p>
        </div>
      </div>

      <div className="border-t border-ivory-50/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory-50/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Biota — a non-commercial showcase.</p>
          <p>Crafted with curiosity. Powered by citizen science.</p>
        </div>
      </div>
    </footer>
  )
}
