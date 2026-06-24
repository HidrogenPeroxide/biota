import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowDown,
  MapPin,
  Sparkles,
  Globe2,
  Users,
  Leaf as LeafIcon,
} from 'lucide-react'
import { HeroSlideshow } from '@/components/shared/HeroSlideshow'
import { Reveal } from '@/components/motion/Reveal'
import { CountUp } from '@/components/motion/CountUp'
import { LazyImage } from '@/components/motion/LazyImage'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useFeaturedSpecies, useGlobalStats, useHeroSlides } from '@/hooks/useBiodiversity'
import { photoUrl } from '@/lib/photos'
import { formatCompact, formatNumber } from '@/lib/utils'
import { TAXONOMY_ROOT, iconColor } from '@/data/taxonomy'

const ease = [0.22, 1, 0.36, 1] as const

export function Landing() {
  const { data: stats, loading: statsLoading } = useGlobalStats()
  const { data: slides, loading: slidesLoading } = useHeroSlides()
  const { data: featured, loading: featuredLoading } = useFeaturedSpecies(
    { iconic_taxa: 'Aves' },
    6,
  )

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        {slidesLoading ? (
          <div className="shimmer absolute inset-0 bg-forest-deep" />
        ) : (
          <HeroSlideshow slides={slides ?? []} />
        )}

        <div className="container-wide relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-ivory-50/60" />
              <span className="text-xs font-medium uppercase tracking-widest-2 text-ivory-50/80">
                A Living Atlas of Biodiversity
              </span>
            </div>
            <h1 className="font-display text-[2.75rem] font-light leading-[1.02] tracking-tight text-ivory-50 sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Every species,
              <br />
              <span className="italic text-sage-light">a story</span> worth
              <br />
              discovering.
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-ivory-50/85">
              Wander through a living natural history museum — millions of
              real wildlife observations, mapped and told like never before.
              Powered by the global community of iNaturalist.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/explore"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ivory-50 px-8 py-4 text-sm font-medium tracking-wide text-forest-deep transition-all duration-500 ease-organic hover:bg-ivory-100 hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.5)]"
              >
                Begin exploring
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory-50/40 px-8 py-4 text-sm font-medium tracking-wide text-ivory-50 backdrop-blur-sm transition-all duration-500 ease-organic hover:bg-ivory-50/10"
              >
                <MapPin className="h-4 w-4" />
                Open the atlas
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.2, ease }}
          className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory-50/60 md:flex"
        >
          <span className="text-[10px] uppercase tracking-widest-2">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============ HEADLINE STATS ============ */}
      <section className="border-y border-stone-light/60 bg-ivory-50">
        <div className="container-wide grid grid-cols-2 gap-y-12 py-16 md:grid-cols-4 md:gap-8">
          <StatBlock
            icon={<Globe2 className="h-5 w-5" strokeWidth={1.5} />}
            value={
              stats ? (
                <CountUp value={stats.observations} compact />
              ) : (
                '—'
              )
            }
            label="Observations"
            sub="citizen-science records"
            loading={statsLoading}
          />
          <StatBlock
            icon={<LeafIcon className="h-5 w-5" strokeWidth={1.5} />}
            value={stats ? <CountUp value={stats.species} compact /> : '—'}
            label="Species"
            sub="and countless more"
            loading={statsLoading}
          />
          <StatBlock
            icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
            value={stats ? <CountUp value={stats.observers} compact /> : '—'}
            label="Naturalists"
            sub="people watching the wild"
            loading={statsLoading}
          />
          <StatBlock
            icon={<Sparkles className="h-5 w-5" strokeWidth={1.5} />}
            value={stats ? <CountUp value={stats.places} compact /> : '—'}
            label="Places"
            sub="corners of the planet"
            loading={statsLoading}
          />
        </div>
        {stats && !stats.live && (
          <p className="pb-6 text-center text-xs text-charcoal-soft/70">
            Showing representative figures — live totals are momentarily
            unavailable.
          </p>
        )}
      </section>

      {/* ============ INTRO NARRATIVE ============ */}
      <section className="container-wide py-28 md:py-40">
        <div className="grid gap-16 md:grid-cols-12 md:items-center">
          <Reveal className="md:col-span-5">
            <p className="eyebrow">The vision</p>
            <h2 className="headline mt-4 text-4xl md:text-5xl">
              Not a database.
              <br />A living world.
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
            <p className="text-pretty text-lg leading-relaxed text-charcoal-soft">
              Every observation here is a small act of wonder — someone,
              somewhere, pausing to notice a beetle, a birdcall, a fern uncurling.
              Together, those moments form the most detailed portrait of life on
              Earth ever assembled.
            </p>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-charcoal-soft">
              Biota turns that vast record into an experience. Browse the tree of
              life, drift across continents of wildlife, and let curiosity lead
              the way.
            </p>
            <Link
              to="/statistics"
              className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-medium text-forest"
            >
              See the data come alive
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ BRANCHES OF LIFE ============ */}
      <section className="bg-forest-deep py-28 text-ivory-50 md:py-40">
        <div className="container-wide">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sage">Branches of life</p>
            <h2 className="headline mt-4 text-4xl text-ivory-50 md:text-5xl">
              Ten doorways into the wild
            </h2>
            <p className="mt-5 text-ivory-50/70">
              Begin with a branch of the tree of life. Each opens onto a whole
              world of species to discover.
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ivory-50/10 bg-ivory-50/10 sm:grid-cols-3 lg:grid-cols-5">
            {TAXONOMY_ROOT.map((node, i) => (
              <Reveal as="div" key={node.id} delay={i * 0.05}>
                <Link
                  to={`/explore?taxon=${node.taxonId}`}
                  className="group flex h-full flex-col justify-between bg-forest-deep p-7 transition-colors duration-700 ease-organic hover:bg-forest"
                >
                  <span
                    className="h-1.5 w-10 rounded-full transition-all duration-700 ease-organic group-hover:w-16"
                    style={{ background: iconColor(node.iconic) }}
                  />
                  <div className="mt-12">
                    <h3 className="font-display text-2xl font-light text-ivory-50">
                      {node.common}
                    </h3>
                    <p className="mt-1 text-xs italic tracking-wide text-ivory-50/50">
                      {node.name}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED SPECIES ============ */}
      <section className="container-wide py-28 md:py-40">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">In the spotlight</p>
            <h2 className="headline mt-4 text-4xl md:text-5xl">
              Featured species
            </h2>
          </div>
          <Link
            to="/explore"
            className="link-underline inline-flex items-center gap-2 text-sm font-medium text-forest"
          >
            Explore all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))
            : (featured ?? []).slice(0, 6).map((row, i) => (
                <Reveal key={row.taxon.id} delay={i * 0.06} className="group">
                  <Link
                    to={`/species/${row.taxon.id}`}
                    className="block overflow-hidden rounded-2xl card-earth"
                  >
                    <LazyImage
                      src={photoUrl(
                        row.taxon.default_photo?.url,
                        'large',
                      )}
                      alt={row.taxon.preferred_common_name || row.taxon.name}
                      ratioClassName="aspect-[4/5]"
                      zoom
                    />
                    <div className="flex items-end justify-between p-5">
                      <div>
                        <h3 className="font-display text-xl leading-tight text-charcoal">
                          {row.taxon.preferred_common_name || row.taxon.name}
                        </h3>
                        <p className="mt-0.5 text-sm italic text-charcoal-soft">
                          {row.taxon.name}
                        </p>
                      </div>
                      <Badge variant="stone">{formatCompact(row.count)}</Badge>
                    </div>
                  </Link>
                </Reveal>
              ))}
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bark-dark via-forest-deep to-forest" />
        <div className="container-wide relative z-10 flex flex-col items-center py-28 text-center md:py-40">
          <Reveal>
            <p className="eyebrow text-sage">Your turn</p>
            <h2 className="headline mx-auto mt-4 max-w-3xl text-4xl text-ivory-50 md:text-6xl">
              The wild is waiting to be noticed.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-ivory-50/75">
              Step into the atlas and follow your curiosity. There's always
              another species, another habitat, another story just around the
              bend.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="group inline-flex items-center gap-2 rounded-full bg-ivory-50 px-8 py-4 text-sm font-medium text-forest-deep transition-all duration-500 ease-organic hover:bg-ivory-100"
              >
                Start exploring
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-full border border-ivory-50/40 px-8 py-4 text-sm font-medium text-ivory-50 transition-colors duration-500 hover:bg-ivory-50/10"
              >
                <MapPin className="h-4 w-4" />
                View the map
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function StatBlock({
  icon,
  value,
  label,
  sub,
  loading,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  sub: string
  loading: boolean
}) {
  return (
    <Reveal className="px-2 text-center md:text-left">
      <div className="mb-4 flex justify-center text-forest md:justify-start">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest/8">
          {icon}
        </span>
      </div>
      {loading ? (
        <Skeleton className="mx-auto h-9 w-28 md:mx-0" />
      ) : (
        <div className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl">
          {value}
        </div>
      )}
      <p className="mt-2 font-display text-base font-medium text-charcoal">
        {label}
      </p>
      <p className="text-xs text-charcoal-soft">{sub}</p>
    </Reveal>
  )
}
