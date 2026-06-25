import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, X, MapPin } from 'lucide-react'
import type { SpeciesCount } from '@/types'
import { LazyImage } from '@/components/motion/LazyImage'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { photoUrl } from '@/lib/photos'
import { formatCompact } from '@/lib/utils'
import { useT } from '@/i18n'

interface SpeciesPanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  species: SpeciesCount[] | null
  loading: boolean
  count?: number
}

/**
 * The slide-in species panel for the Explore page. When a taxon is selected,
 * this panel eases in from the right showing the most-observed species within
 * it — the bridge between the taxonomy tree, the map, and the detail page.
 */
export function SpeciesPanel({
  open,
  onClose,
  title,
  subtitle,
  species,
  loading,
  count,
}: SpeciesPanelProps) {
  const t = useT()
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-charcoal/30 backdrop-blur-[2px] lg:hidden"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-stone-light/70 bg-ivory-50 shadow-[-24px_0_60px_-30px_rgba(38,36,31,0.35)]"
          >
            <header className="flex items-start justify-between border-b border-stone-light/60 p-6">
              <div className="pr-4">
                <p className="eyebrow">{t('explore.speciesPanelEyebrow')}</p>
                <h2 className="mt-2 font-display text-2xl font-light leading-tight text-charcoal">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-1 text-sm italic text-charcoal-soft">
                    {subtitle}
                  </p>
                )}
                {typeof count === 'number' && (
                  <p className="mt-2 text-xs leading-cn text-charcoal-soft">
                    {t('explore.speciesRecorded', { count: formatCompact(count) })}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label={t('explore.collapse')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-light text-charcoal-soft transition-colors hover:bg-ivory-200"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2 py-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : species && species.length > 0 ? (
                <ul className="flex flex-col divide-y divide-stone-light/50">
                  {species.map((row, i) => (
                    <motion.li
                      key={row.taxon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(i * 0.04, 0.4),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        to={`/species/${row.taxon.id}`}
                        className="group flex items-center gap-4 py-4"
                      >
                        <LazyImage
                          src={photoUrl(row.taxon.default_photo?.url, 'medium')}
                          alt={row.taxon.preferred_common_name || row.taxon.name}
                          ratioClassName="h-20 w-20 shrink-0 rounded-xl"
                          zoom
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-lg leading-tight text-charcoal">
                            {row.taxon.preferred_common_name || row.taxon.name}
                          </h3>
                          <p className="truncate text-sm italic text-charcoal-soft">
                            {row.taxon.name}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="stone">
                              <MapPin className="mr-1 h-3 w-3" />
                              {formatCompact(row.count)} {t('label.obs')}
                            </Badge>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-charcoal-soft transition-all duration-500 ease-organic group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="py-10 text-center text-sm leading-cn text-charcoal-soft">
                  {t('explore.speciesEmpty')}
                </p>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
