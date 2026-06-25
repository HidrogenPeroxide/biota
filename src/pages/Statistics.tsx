import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  PieChart,
  LineChart as LineIcon,
  Grid3x3,
  Trophy,
  Bird,
} from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { Skeleton } from '@/components/ui/skeleton'
import { Treemap } from '@/components/charts/Treemap'
import { Sunburst } from '@/components/charts/Sunburst'
import { TrendLine } from '@/components/charts/TrendLine'
import { Heatmap } from '@/components/charts/Heatmap'
import type { HeatmapCell } from '@/components/charts/Heatmap'
import { BarList, type BarDatum } from '@/components/charts/BarList'
import { useStatistics } from '@/hooks/useStatistics'
import { useGlobalStats } from '@/hooks/useBiodiversity'
import { CountUp } from '@/components/motion/CountUp'
import { iconicLabel } from '@/data/taxonomy'
import { useT } from '@/i18n'

export function Statistics() {
  const stats = useStatistics()
  const { data: global } = useGlobalStats()
  const navigate = useNavigate()
  const t = useT()
  const [hover, setHover] = useState<{ name: string; value: number } | null>(null)

  // Localize the seasonal heatmap rows + cells to the active language.
  const seasonRows = useMemo(
    () => stats.seasonGroups.map((g) => iconicLabel(t, g)),
    [stats.seasonGroups, t],
  )
  const seasonCells = useMemo<HeatmapCell[]>(
    () =>
      stats.seasonality.map((c) => ({ ...c, row: iconicLabel(t, c.row) })),
    [stats.seasonality, t],
  )

  // Localize the treemap/sunburst hierarchy: root "Life" + each group node.
  const hierarchy = useMemo(
    () => ({
      name: t('taxa.Life'),
      value: stats.hierarchy.value,
      children: stats.hierarchy.children?.map((g) => ({
        ...g,
        name: iconicLabel(t, g.name),
      })),
    }),
    [stats.hierarchy, t],
  )

  return (
    <PageTransition>
      <div className="pt-[72px]">
        {/* Header */}
        <header className="border-b border-stone-light/60 bg-gradient-to-b from-ivory-200/60 to-ivory-50">
          <div className="container-wide py-16 md:py-24">
            <Reveal>
              <p className="eyebrow">{t('stats.eyebrow')}</p>
              <h1 className="headline mt-3 max-w-3xl text-4xl md:text-6xl">
                {t('stats.title')}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty leading-cn text-lg text-charcoal-soft">
                {t('stats.body')}
              </p>
            </Reveal>

            {/* Headline tiles */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              <HeaderStat
                label={t('stats.observations')}
                value={global ? <CountUp value={global.observations} compact /> : '—'}
              />
              <HeaderStat
                label={t('stats.speciesRecorded')}
                value={global ? <CountUp value={global.species} compact /> : '—'}
              />
              <HeaderStat
                label={t('stats.naturalists')}
                value={global ? <CountUp value={global.observers} compact /> : '—'}
              />
              <HeaderStat
                label={t('stats.majorGroups')}
                value={<CountUp value={stats.groups.length || 10} />}
              />
            </div>
          </div>
        </header>

        <div className="container-wide space-y-20 py-20 md:space-y-28 md:py-28">
          {/* Diversity — treemap + sunburst */}
          <section>
            <Reveal>
              <SectionTitle
                icon={<Grid3x3 className="h-5 w-5" />}
                eyebrow={t('stats.diversity.eyebrow')}
                title={t('stats.diversity.title')}
                desc={t('stats.diversity.desc')}
              />
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <ChartCard
                  title={t('stats.chart.volumeTitle')}
                  badge={<BarChart3 className="h-4 w-4" />}
                >
                  {stats.loading ? (
                    <Skeleton className="h-[380px] w-full rounded-xl" />
                  ) : (
                    <Treemap data={hierarchy} onHover={setHover} />
                  )}
                  <ChartCaption>
                    {hover
                      ? t('stats.chart.hoverValue', {
                          name: hover.name,
                          value: hover.value.toLocaleString(),
                        })
                      : t('stats.chart.hoverHint')}
                  </ChartCaption>
                </ChartCard>
              </Reveal>
              <Reveal delay={0.12} className="lg:col-span-2">
                <ChartCard
                  title={t('stats.chart.sunburstTitle')}
                  badge={<PieChart className="h-4 w-4" />}
                >
                  {stats.loading ? (
                    <Skeleton className="mx-auto h-[380px] w-[380px] rounded-xl" />
                  ) : (
                    <Sunburst data={hierarchy} onHover={setHover} />
                  )}
                  <ChartCaption>{t('stats.chart.sunburstCaption')}</ChartCaption>
                </ChartCard>
              </Reveal>
            </div>
          </section>

          {/* Trend line */}
          <section>
            <Reveal>
              <SectionTitle
                icon={<LineIcon className="h-5 w-5" />}
                eyebrow={t('stats.growth.eyebrow')}
                title={t('stats.growth.title')}
                desc={t('stats.growth.desc')}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <ChartCard title={t('stats.chart.growthTitle')}>
                  {stats.loading ? (
                    <Skeleton className="h-[320px] w-full rounded-xl" />
                  ) : (
                    <TrendLine data={stats.trend} height={320} />
                  )}
                  <ChartCaption>{t('stats.growthCaption')}</ChartCaption>
                </ChartCard>
              </div>
            </Reveal>
          </section>

          {/* Seasonal heatmap */}
          <section>
            <Reveal>
              <SectionTitle
                icon={<Bird className="h-5 w-5" />}
                eyebrow={t('stats.season.eyebrow')}
                title={t('stats.season.title')}
                desc={t('stats.season.desc')}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <ChartCard title={t('stats.chart.seasonTitle')}>
                  {stats.loading ? (
                    <Skeleton className="h-[260px] w-full rounded-xl" />
                  ) : (
                    <Heatmap cells={seasonCells} rows={seasonRows} />
                  )}
                </ChartCard>
              </div>
            </Reveal>
          </section>

          {/* Top species + observers */}
          <section>
            <Reveal>
              <SectionTitle
                icon={<Trophy className="h-5 w-5" />}
                eyebrow={t('stats.standouts.eyebrow')}
                title={t('stats.standouts.title')}
                desc={t('stats.standouts.desc')}
              />
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Reveal>
                <ChartCard title={t('stats.chart.topSpeciesTitle')}>
                  {stats.loading ? (
                    <Skeleton className="h-[520px] w-full rounded-xl" />
                  ) : stats.topSpecies.length ? (
                    <BarList
                      data={stats.topSpecies}
                      onSelect={(d: BarDatum) => d.href && navigate(d.href)}
                      format={(v) => v.toLocaleString()}
                    />
                  ) : (
                    <Empty />
                  )}
                </ChartCard>
              </Reveal>
              <Reveal delay={0.12}>
                <ChartCard title={t('stats.chart.topObserversTitle')}>
                  {stats.loading ? (
                    <Skeleton className="h-[420px] w-full rounded-xl" />
                  ) : stats.topObservers.length ? (
                    <BarList data={stats.topObservers} format={(v) => v.toLocaleString()} />
                  ) : (
                    <Empty />
                  )}
                </ChartCard>
              </Reveal>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

/* ------------------------------ bits ------------------------------ */

function SectionTitle({
  icon,
  eyebrow,
  title,
  desc,
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  desc: string
}) {
  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-end">
      <div className="md:col-span-7">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/8 text-forest">
            {icon}
          </span>
          <p className="eyebrow">{eyebrow}</p>
        </div>
        <h2 className="headline mt-4 text-3xl md:text-4xl">{title}</h2>
      </div>
      <p className="text-pretty leading-cn text-charcoal-soft md:col-span-5">{desc}</p>
    </div>
  )
}

function ChartCard({
  title,
  badge,
  children,
}: {
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="card-earth h-full p-6">
      <div className="mb-5 flex items-center gap-2">
        {badge && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest/8 text-forest">
            {badge}
          </span>
        )}
        <h3 className="font-display text-lg text-charcoal">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ChartCaption({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      key={String(children)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-4 text-center text-xs leading-cn text-charcoal-soft"
    >
      {children}
    </motion.p>
  )
}

function HeaderStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-light/70 bg-ivory-50 p-5">
      <p className="font-display text-3xl font-light text-charcoal">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-charcoal-soft">
        {label}
      </p>
    </div>
  )
}

function Empty() {
  const t = useT()
  return (
    <p className="py-10 text-center text-sm leading-cn text-charcoal-soft">
      {t('stats.loading')}
    </p>
  )
}
