import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, GitBranch, MapPin, BarChart3, Globe2, Users, Leaf as LeafIcon, Sparkles } from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { CountUp } from '@/components/motion/CountUp'
import { LazyImage } from '@/components/motion/LazyImage'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useGlobalStats, useFeaturedSpecies } from '@/hooks/useBiodiversity'
import { photoUrl } from '@/lib/photos'
import { formatCompact } from '@/lib/utils'
import { TAXONOMY_ROOT, iconColor, iconicLabel } from '@/data/taxonomy'
import { useT } from '@/i18n'

const ease = [0.22, 1, 0.36, 1] as const

export function LifeDataHub() {
  const t = useT()
  const { data: stats, loading: statsLoading } = useGlobalStats()
  const { data: featured, loading: featuredLoading } = useFeaturedSpecies(
    { iconic_taxa: 'Aves' },
    6,
  )

  return (
    <PageTransition>
      <div className="pt-[72px]">
        {/* Header */}
        <header className="border-b border-stone-light/60 bg-gradient-to-b from-ivory-200/60 to-ivory-50">
          <div className="container-wide py-16 md:py-24">
            <Reveal>
              <p className="eyebrow">{t('lifeData.eyebrow')}</p>
              <h1 className="headline mt-3 max-w-3xl text-4xl md:text-6xl">
                {t('lifeData.title')}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty leading-cn text-lg text-charcoal-soft">
                {t('lifeData.body')}
              </p>
            </Reveal>

            {/* Entry cards */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <EntryCard
                to="/life-data/explore"
                icon={<GitBranch className="h-5 w-5" />}
                title={t('lifeData.explore')}
                desc={t('lifeData.exploreDesc')}
              />
              <EntryCard
                to="/life-data/map"
                icon={<MapPin className="h-5 w-5" />}
                title={t('lifeData.map')}
                desc={t('lifeData.mapDesc')}
              />
              <EntryCard
                to="/life-data/stats"
                icon={<BarChart3 className="h-5 w-5" />}
                title={t('lifeData.stats')}
                desc={t('lifeData.statsDesc')}
              />
            </div>
          </div>
        </header>

        {/* Headline stats */}
        <section className="border-b border-stone-light/60 bg-ivory-50">
          <div className="container-wide grid grid-cols-2 gap-y-12 py-16 md:grid-cols-4 md:gap-8">
            <StatBlock
              icon={<Globe2 className="h-5 w-5" strokeWidth={1.5} />}
              value={stats ? <CountUp value={stats.observations} compact /> : '—'}
              label={t('home.stats.observations')}
              sub={t('home.stats.observationsSub')}
              loading={statsLoading}
            />
            <StatBlock
              icon={<LeafIcon className="h-5 w-5" strokeWidth={1.5} />}
              value={stats ? <CountUp value={stats.species} compact /> : '—'}
              label={t('home.stats.species')}
              sub={t('home.stats.speciesSub')}
              loading={statsLoading}
            />
            <StatBlock
              icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
              value={stats ? <CountUp value={stats.observers} compact /> : '—'}
              label={t('home.stats.naturalists')}
              sub={t('home.stats.naturalistsSub')}
              loading={statsLoading}
            />
            <StatBlock
              icon={<Sparkles className="h-5 w-5" strokeWidth={1.5} />}
              value={stats ? <CountUp value={stats.places} compact /> : '—'}
              label={t('home.stats.places')}
              sub={t('home.stats.placesSub')}
              loading={statsLoading}
            />
          </div>
        </section>

        {/* Branches of life */}
        <section className="bg-forest-deep py-24 text-ivory-50 md:py-32">
          <div className="container-wide">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-sage">{t('home.branches.eyebrow')}</p>
              <h2 className="headline mt-4 text-4xl text-ivory-50 md:text-5xl">
                {t('home.branches.title')}
              </h2>
              <p className="mt-5 leading-cn text-ivory-50/70">
                {t('home.branches.body')}
              </p>
            </Reveal>

            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ivory-50/10 bg-ivory-50/10 sm:grid-cols-3 lg:grid-cols-5">
              {TAXONOMY_ROOT.map((node, i) => (
                <Reveal as="div" key={node.id} delay={i * 0.05}>
                  <Link
                    to={`/life-data/explore?taxon=${node.taxonId}`}
                    className="group flex h-full flex-col justify-between bg-forest-deep p-7 transition-colors duration-700 ease-organic hover:bg-forest"
                  >
                    <span
                      className="h-1.5 w-10 rounded-full transition-all duration-700 ease-organic group-hover:w-16"
                      style={{ background: iconColor(node.iconic) }}
                    />
                    <div className="mt-12">
                      <h3 className="font-display text-2xl font-light text-ivory-50">
                        {iconicLabel(t, node.iconic)}
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

        {/* Featured species */}
        <section className="container-wide py-24 md:py-32">
          <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">{t('home.featured.eyebrow')}</p>
              <h2 className="headline mt-4 text-4xl md:text-5xl">
                {t('home.featured.title')}
              </h2>
            </div>
            <Link
              to="/life-data/explore"
              className="link-underline inline-flex items-center gap-2 text-sm font-medium text-forest"
            >
              {t('home.featured.link')}
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
                      to={`/life-data/species/${row.taxon.id}`}
                      className="block overflow-hidden rounded-2xl card-earth"
                    >
                      <LazyImage
                        src={photoUrl(row.taxon.default_photo?.url, 'large')}
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
      </div>
    </PageTransition>
  )
}

function EntryCard({
  to,
  icon,
  title,
  desc,
}: {
  to: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-stone-light/70 bg-ivory-50 p-6 transition-all duration-500 ease-organic hover:border-forest/40 hover:shadow-[0_18px_40px_-24px_rgba(38,36,31,0.3)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/8 text-forest transition-transform duration-500 group-hover:scale-105">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl text-charcoal">{title}</h3>
      <p className="mt-1 text-sm leading-cn text-charcoal-soft">{desc}</p>
      <span className="link-underline mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
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
      <p className="text-xs leading-cn text-charcoal-soft">{sub}</p>
    </Reveal>
  )
}
