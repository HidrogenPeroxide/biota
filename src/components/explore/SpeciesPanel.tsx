import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import type { SpeciesCount } from '@/types'
import { LazyImage } from '@/components/motion/LazyImage'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { photoUrl } from '@/lib/photos'
import { formatCompact } from '@/lib/utils'
import { useT } from '@/i18n'

interface SpeciesPanelProps {
  /** Whether a selection exists — mounts the drawer + toggle. */
  open: boolean
  /** Expanded vs collapsed. */
  collapsed: boolean
  onToggleCollapsed: () => void
  title: string
  subtitle?: string
  species: SpeciesCount[] | null
  loading: boolean
  count?: number
  /** Iconic-taxon accent color for the indicator dot. */
  accentColor?: string
}

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Floating species drawer, aligned to the map's right & bottom edges.
 *
 *   Collapsed: only the circular toggle is shown, hugging the map's right edge.
 *   Expanded:  the drawer sits flush with the map's right + bottom edges; the
 *              circular toggle rides on the drawer's left edge.
 *
 * Both states are absolutely positioned within the map wrapper, so alignment
 * tracks the map exactly regardless of viewport size.
 */
export function SpeciesPanel({
  open,
  collapsed,
  onToggleCollapsed,
  title,
  subtitle,
  species,
  loading,
  count,
  accentColor = '#4E6B47',
}: SpeciesPanelProps) {
  const t = useT()

  return (
    <>
      {/* ===== Circular toggle =====
          Collapsed: pinned to the map's right edge, vertically centered.
          Expanded:  rides on the drawer's left edge (-left-16). */}
      <AnimatePresence>
        {open && (
          <motion.button
            key="toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              right: collapsed ? 0 : undefined,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease }}
            onClick={onToggleCollapsed}
            aria-label={collapsed ? t('explore.expand') : t('explore.collapse')}
            className="pointer-events-auto absolute top-1/2 z-[1101] flex h-14 w-14 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-stone-light/70 bg-ivory-50 text-forest shadow-xl transition-transform duration-500 ease-organic hover:scale-105"
            style={{ right: collapsed ? 0 : 360 }}
          >
            {collapsed ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
            <span
              className="mt-0.5 h-1.5 w-1.5 rounded-full"
              style={{ background: accentColor }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ===== Drawer body =====
          Expanded: flush with map right + bottom edges; leaves the top clear so
          it doesn't fight the "viewing" chip. Collapsed: unmounted. */}
      <AnimatePresence>
        {open && !collapsed && (
          <motion.aside
            key="drawer"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="pointer-events-auto absolute bottom-0 right-0 top-16 z-[1100] flex w-[min(88vw,360px)] flex-col overflow-hidden rounded-l-2xl border border-stone-light/70 bg-ivory-50/93 shadow-[-24px_0_60px_-28px_rgba(38,36,31,0.5)] backdrop-blur-xl"
            aria-label={t('explore.speciesPanelEyebrow')}
          >
            <header className="border-b border-stone-light/60 p-6">
              <p className="eyebrow">{t('explore.speciesPanelEyebrow')}</p>
              <h2 className="mt-2 font-display text-2xl font-light leading-tight text-charcoal">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm italic text-charcoal-soft">{subtitle}</p>
              )}
              {typeof count === 'number' && (
                <p className="mt-2 text-xs leading-cn text-charcoal-soft">
                  {t('explore.speciesRecorded', { count: formatCompact(count) })}
                </p>
              )}
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
                      transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.4), ease }}
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
        )}
      </AnimatePresence>
    </>
  )
}
