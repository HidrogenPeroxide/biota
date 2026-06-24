import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Globe2,
  ImageIcon,
  Users,
  Eye,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react'
import { ObservationMap } from '@/components/map/ObservationMap'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { LazyImage } from '@/components/motion/LazyImage'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/States'
import { useAsync } from '@/hooks/useAsync'
import { fetchObservations, fetchTaxon } from '@/api/inaturalist'
import { photoUrl, pickPhoto } from '@/lib/photos'
import { formatCompact, formatNumber } from '@/lib/utils'
import type { Observation, Taxon } from '@/types'

const ease = [0.22, 1, 0.36, 1] as const

export function SpeciesDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: taxon, loading: taxonLoading } = useAsync<Taxon | null>(
    () => fetchTaxon(id!, { includeAncestors: true }),
    [id],
  )

  const { data: observations, loading: obsLoading } = useAsync<Observation[]>(
    () =>
      fetchObservations({
        taxon_id: Number(id),
        order_by: 'votes',
        order: 'desc',
        per_page: 80,
      }),
    [id],
  )

  if (taxonLoading) return <DetailSkeleton />
  if (!taxon) {
    return (
      <PageTransition>
        <div className="container-wide pt-[72px]">
          <div className="py-24">
            <EmptyState
              title="Species not found"
              message="We couldn't load this species. It may have been reclassified or the network is unavailable."
            />
          </div>
        </div>
      </PageTransition>
    )
  }

  const photos = (taxon.taxon_photos ?? [])
    .map((tp) => photoUrl(tp.photo.url, 'large'))
    .filter(Boolean)
    .slice(0, 8)

  const gallery = (observations ?? [])
    .filter((o) => o.photos?.[0])
    .slice(0, 12)

  const ancestors = taxon.ancestors ?? []

  return (
    <PageTransition>
      {/* ============ HERO IMAGE ============ */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease }}
          className="absolute inset-0"
        >
          <LazyImage
            src={photoUrl(taxon.default_photo?.url, 'large')}
            alt={taxon.preferred_common_name || taxon.name}
            ratioClassName="absolute inset-0"
            className="animate-slow-pan"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />

        <div className="container-wide absolute inset-x-0 bottom-0 z-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.3 }}
          >
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm text-ivory-50/80 transition-colors hover:text-ivory-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to explore
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge variant="default">{capitalize(taxon.rank)}</Badge>
              {taxon.iconic_taxon_name && (
                <Badge variant="stone">{taxon.iconic_taxon_name}</Badge>
              )}
              {taxon.conservation_status?.status_name && (
                <Badge variant="clay">
                  <ShieldAlert className="mr-1 h-3 w-3" />
                  {taxon.conservation_status.status_name}
                </Badge>
              )}
            </div>
            <h1 className="mt-4 font-display text-5xl font-light text-ivory-50 md:text-7xl">
              {taxon.preferred_common_name || capitalizedName(taxon.name)}
            </h1>
            <p className="mt-2 text-xl italic text-ivory-50/80">{taxon.name}</p>
          </motion.div>
        </div>
      </section>

      {/* ============ BODY ============ */}
      <section className="container-wide grid gap-16 py-20 md:grid-cols-12">
        {/* Main column */}
        <div className="md:col-span-7">
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 className="headline mt-3 text-3xl md:text-4xl">
              A closer look
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-charcoal-soft">
              {taxon.wikipedia_summary
                ? cleanSummary(taxon.wikipedia_summary)
                : `Little has been written here yet. ${taxon.preferred_common_name || taxon.name} is one of countless species documented by naturalists on iNaturalist — each observation a small contribution to our understanding of life on Earth.`}
            </p>
            {taxon.wikipedia_url && (
              <a
                href={taxon.wikipedia_url}
                target="_blank"
                rel="noreferrer"
                className="link-underline mt-6 inline-flex items-center gap-2 text-sm font-medium text-forest"
              >
                Read on Wikipedia
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </Reveal>

          {/* Stats strip */}
          <Reveal delay={0.15}>
            <div className="mt-12 grid grid-cols-3 gap-4">
              <MiniStat
                icon={<Eye className="h-4 w-4" />}
                value={taxon.observations_count}
                label="Observations"
              />
              <MiniStat
                icon={<Users className="h-4 w-4" />}
                value={observations?.length ?? 0}
                label="Shown here"
                compact
              />
              <MiniStat
                icon={<TrendingUp className="h-4 w-4" />}
                value={taxon.complete_species_count ?? undefined}
                label="Species in group"
              />
            </div>
          </Reveal>

          {/* Gallery of recent observations */}
          <Reveal delay={0.1}>
            <div className="mt-16">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-forest" />
                <h3 className="font-display text-2xl">From the field</h3>
              </div>
              <p className="mt-1 text-sm text-charcoal-soft">
                Recent community observations of this species.
              </p>
              {obsLoading ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : gallery.length ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((o, i) => (
                    <motion.a
                      key={o.id}
                      href={o.uri || `https://www.inaturalist.org/observations/${o.id}`}
                      target="_blank"
                      rel="noreferrer"
                      initial={{ opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: (i % 3) * 0.05, ease }}
                      className="group relative aspect-square overflow-hidden rounded-xl"
                    >
                      <LazyImage
                        src={pickPhoto(o.photos?.[0], 'medium')}
                        alt={o.taxon?.preferred_common_name || ''}
                        ratioClassName="absolute inset-0"
                        zoom
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <p className="truncate text-xs text-ivory-50">
                          {o.place_guess || 'Unknown location'}
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-charcoal-soft">
                  No recent photos available.
                </p>
              )}
            </div>
          </Reveal>
        </div>

        {/* Side column: taxonomy + distribution */}
        <aside className="md:col-span-5 md:pl-6 lg:pl-12">
          <Reveal delay={0.1}>
            <p className="eyebrow">Classification</p>
            <h3 className="headline mt-3 text-2xl md:text-3xl">
              Where it belongs
            </h3>

            <ol className="mt-6 flex flex-col gap-1">
              {[...ancestors, taxon].map((node, i, arr) => {
                const isLast = i === arr.length - 1
                return (
                  <motion.li
                    key={node.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease }}
                    className="flex items-baseline justify-between border-b border-stone-light/60 py-3"
                  >
                    <span className="text-xs uppercase tracking-wider text-charcoal-soft">
                      {capitalize(node.rank)}
                    </span>
                    <span
                      className={`text-right text-sm ${
                        isLast
                          ? 'font-semibold text-forest'
                          : 'text-charcoal'
                      } ${node.rank === 'species' ? 'italic' : ''}`}
                    >
                      {node.name}
                    </span>
                  </motion.li>
                )
              })}
            </ol>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-forest" />
                <h3 className="font-display text-2xl">Distribution</h3>
              </div>
              <p className="mt-1 text-sm text-charcoal-soft">
                Where naturalists have recorded this species.
              </p>
              <div className="mt-5 h-[360px] overflow-hidden rounded-2xl border border-stone-light/70">
                {obsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ObservationMap
                    observations={observations ?? []}
                    mode="heat"
                    interactive
                    className="h-full w-full"
                  />
                )}
              </div>
            </div>
          </Reveal>

          {/* Curated taxon photos */}
          {photos.length > 1 && (
            <Reveal delay={0.15}>
              <div className="mt-10">
                <h3 className="font-display text-2xl">Gallery</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {photos.slice(0, 4).map((src) => (
                    <LazyImage
                      key={src}
                      src={src}
                      alt={taxon.preferred_common_name || taxon.name}
                      ratioClassName="aspect-[4/3] rounded-xl"
                      zoom
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </aside>
      </section>
    </PageTransition>
  )
}

function MiniStat({
  icon,
  value,
  label,
  compact,
}: {
  icon: React.ReactNode
  value?: number | null
  label: string
  compact?: boolean
}) {
  return (
    <div className="rounded-2xl border border-stone-light/70 bg-ivory-50 p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest/8 text-forest">
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl font-light text-charcoal">
        {value ? (compact ? formatCompact(value) : formatNumber(value)) : '—'}
      </p>
      <p className="text-xs text-charcoal-soft">{label}</p>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="pt-[72px]">
      <Skeleton className="h-[60vh] w-full" />
      <div className="container-wide grid gap-16 py-20 md:grid-cols-12">
        <div className="md:col-span-7">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-4 h-10 w-64" />
          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/6" />
        </div>
        <div className="md:col-span-5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function capitalize(s?: string) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function capitalizedName(s?: string) {
  return capitalize(s)
}
function cleanSummary(s: string) {
  // iNaturalist returns Wikipedia summaries with inline HTML tags and
  // trailing citations. Strip tags and tidy whitespace for clean display.
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/\s*\([^)]*\d{4}\)\s*$/, '')
    .trim()
}
