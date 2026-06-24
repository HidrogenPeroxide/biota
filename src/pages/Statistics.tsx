import { useState } from 'react'
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
import { BarList, type BarDatum } from '@/components/charts/BarList'
import { useStatistics } from '@/hooks/useStatistics'
import { useGlobalStats } from '@/hooks/useBiodiversity'
import { CountUp } from '@/components/motion/CountUp'

export function Statistics() {
  const stats = useStatistics()
  const { data: global } = useGlobalStats()
  const navigate = useNavigate()
  const [hover, setHover] = useState<{ name: string; value: number } | null>(null)

  return (
    <PageTransition>
      <div className="pt-[72px]">
        {/* Header */}
        <header className="border-b border-stone-light/60 bg-gradient-to-b from-ivory-200/60 to-ivory-50">
          <div className="container-wide py-16 md:py-24">
            <Reveal>
              <p className="eyebrow">Insights</p>
              <h1 className="headline mt-3 max-w-3xl text-4xl md:text-6xl">
                The state of the living world, in data
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-lg text-charcoal-soft">
                A scientific view across every branch of life — diversity,
                seasonal rhythms, growth, and the people who document it.
              </p>
            </Reveal>

            {/* Headline tiles */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              <HeaderStat
                label="Observations"
                value={global ? <CountUp value={global.observations} compact /> : '—'}
              />
              <HeaderStat
                label="Species recorded"
                value={global ? <CountUp value={global.species} compact /> : '—'}
              />
              <HeaderStat
                label="Naturalists"
                value={global ? <CountUp value={global.observers} compact /> : '—'}
              />
              <HeaderStat
                label="Major groups"
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
                eyebrow="Diversity"
                title="Species across the branches"
                desc="Each rectangle's area encodes observation volume. The radial view shows how a group divides into its most-recorded species."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-5">
              <Reveal className="lg:col-span-3">
                <ChartCard
                  title="Observation volume by group & species"
                  badge={<BarChart3 className="h-4 w-4" />}
                >
                  {stats.loading ? (
                    <Skeleton className="h-[380px] w-full rounded-xl" />
                  ) : (
                    <Treemap
                      data={stats.hierarchy}
                      onHover={setHover}
                    />
                  )}
                  <ChartCaption>
                    {hover
                      ? `${hover.name} — ${hover.value.toLocaleString()}`
                      : 'Hover a cell to inspect a species.'}
                  </ChartCaption>
                </ChartCard>
              </Reveal>
              <Reveal delay={0.12} className="lg:col-span-2">
                <ChartCard
                  title="Radial taxonomy"
                  badge={<PieChart className="h-4 w-4" />}
                >
                  {stats.loading ? (
                    <Skeleton className="mx-auto h-[380px] w-[380px] rounded-xl" />
                  ) : (
                    <Sunburst data={stats.hierarchy} onHover={setHover} />
                  )}
                  <ChartCaption>
                    Rings from center: kingdom → class → top species.
                  </ChartCaption>
                </ChartCard>
              </Reveal>
            </div>
          </section>

          {/* Trend line */}
          <section>
            <Reveal>
              <SectionTitle
                icon={<LineIcon className="h-5 w-5" />}
                eyebrow="Growth"
                title="A movement, gaining momentum"
                desc="Relative growth in research-grade observations since iNaturalist began — a proxy for how citizen science has expanded our window onto nature."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <ChartCard title="Observation growth (relative)">
                  {stats.loading ? (
                    <Skeleton className="h-[320px] w-full rounded-xl" />
                  ) : (
                    <TrendLine data={stats.trend} height={320} />
                  )}
                </ChartCard>
              </div>
            </Reveal>
          </section>

          {/* Seasonal heatmap */}
          <section>
            <Reveal>
              <SectionTitle
                icon={<Bird className="h-5 w-5" />}
                eyebrow="Seasons"
                title="When nature shows itself"
                desc="Monthly observation activity per group reveals the seasonal pulse of life — spring awakenings, summer peaks, winter quiet."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-10">
                <ChartCard title="Seasonal observation activity">
                  {stats.loading ? (
                    <Skeleton className="h-[260px] w-full rounded-xl" />
                  ) : (
                    <Heatmap
                      cells={stats.seasonality}
                      rows={stats.seasonGroups}
                    />
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
                eyebrow="Standouts"
                title="The most noticed"
                desc="The species and naturalists at the heart of the record — the most-observed species, and the people behind the most observations."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Reveal>
                <ChartCard title="Most observed species">
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
                <ChartCard title="Top contributors">
                  {stats.loading ? (
                    <Skeleton className="h-[420px] w-full rounded-xl" />
                  ) : stats.topObservers.length ? (
                    <BarList
                      data={stats.topObservers}
                      format={(v) => v.toLocaleString()}
                    />
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
      <p className="text-pretty text-charcoal-soft md:col-span-5">{desc}</p>
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
      className="mt-4 text-center text-xs text-charcoal-soft"
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
  return (
    <p className="py-10 text-center text-sm text-charcoal-soft">
      Data is loading or momentarily unavailable.
    </p>
  )
}
