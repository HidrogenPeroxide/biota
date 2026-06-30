import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowDown, MapPin, BarChart3, GitBranch } from 'lucide-react'
import { HeroSlideshow } from '@/components/shared/HeroSlideshow'
import { JourneyMap } from '@/components/journey/JourneyMap'
import { Reveal } from '@/components/motion/Reveal'
import { LazyImage } from '@/components/motion/LazyImage'
import { useHeroSlides } from '@/hooks/useBiodiversity'
import { useAllJourneyMedia } from '@/hooks/useJourneyMedia'
import { JOURNEYS, type Journey } from '@/data/journeys'
import { useI18n, useT } from '@/i18n'

const ease = [0.22, 1, 0.36, 1] as const

export function Landing() {
  const t = useT()
  const { lang } = useI18n()
  const { data: slides, loading: slidesLoading } = useHeroSlides()
  const media = useAllJourneyMedia()
  const [selected, setSelected] = useState<Journey | null>(null)

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
                {t('home.story.eyebrow')}
              </span>
            </div>
            <h1 className="font-display text-[2.6rem] font-light leading-[1.12] tracking-tight text-ivory-50 sm:text-6xl md:text-7xl lg:text-[5.2rem]">
              {t('home.story.title1')}
              <br />
              <span className="accent text-ochre">{t('home.story.titleAccent')}</span>
            </h1>
            <p className="mt-8 max-w-xl text-pretty leading-cn text-lg text-ivory-50/85">
              {t('home.story.subtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#journey"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ivory-50 px-8 py-4 text-sm font-medium tracking-wide text-forest-deep transition-all duration-500 ease-organic hover:bg-ivory-100"
              >
                {t('home.story.cta1')}
                <ArrowDown className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-y-0.5" />
              </a>
              <Link
                to="/life-data/explore"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory-50/40 px-8 py-4 text-sm font-medium tracking-wide text-ivory-50 backdrop-blur-sm transition-all duration-500 ease-organic hover:bg-ivory-50/10"
              >
                <MapPin className="h-4 w-4" />
                {t('home.story.cta2')}
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.2, ease }}
          className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ivory-50/60 md:flex"
        >
          <span className="text-[10px] uppercase tracking-widest-2">
            {t('home.story.scroll')}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============ JOURNEY MAP ============ */}
      <section id="journey" className="bg-forest-deep py-24 text-ivory-50 md:py-32">
        <div className="container-wide">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sage">{t('home.journey.eyebrow')}</p>
            <h2 className="headline mt-4 text-4xl text-ivory-50 md:text-5xl">
              {t('home.journey.title')}
            </h2>
            <p className="mt-5 leading-cn text-ivory-50/70">
              {t('home.journey.body')}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease }}
              className="relative mt-12 h-[60vh] min-h-[420px] overflow-hidden rounded-3xl border border-ivory-50/10 shadow-2xl md:h-[68vh]"
            >
              <JourneyMap
                journeys={JOURNEYS}
                media={media}
                selectedSlug={selected?.slug ?? null}
                onSelect={setSelected}
                lang={lang}
                className="absolute inset-0 h-full w-full"
              />

              {/* Slide-in preview panel for the selected day */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 40, opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="absolute bottom-5 right-5 top-5 z-[600] flex w-[78vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-ivory-50/15 bg-charcoal/80 backdrop-blur-xl md:w-96"
                  >
                    {media[selected.slug]?.cover && (
                      <div className="relative h-40 shrink-0 overflow-hidden">
                        <img
                          src={media[selected.slug]!.cover!}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 to-transparent" />
                        <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ochre font-display text-sm font-semibold text-charcoal">
                          {selected.day}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[10px] uppercase tracking-widest-2 text-sage">
                        {t('home.chapters.day', { n: selected.day })}
                      </p>
                      <h3 className="mt-1 font-display text-2xl text-ivory-50">
                        {selected.location[lang]}
                      </h3>
                      <p className="mt-0.5 text-xs italic text-ivory-50/55">
                        {selected.region[lang]} · {selected.date}
                      </p>
                      <p className="mt-4 text-pretty leading-cn text-sm text-ivory-50/75">
                        {selected.intro[lang]}
                      </p>
                      {media[selected.slug]?.speciesCount ? (
                        <p className="mt-3 text-xs text-sage">
                          {t('home.chapters.species', {
                            count: media[selected.slug]!.speciesCount,
                          })}
                        </p>
                      ) : null}
                      <div className="mt-auto pt-5">
                        <Link
                          to={`/journey/${selected.slug}`}
                          className="group inline-flex items-center gap-2 text-sm font-medium text-ochre"
                        >
                          {t('home.journey.readStory')}
                          <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-charcoal/60 px-4 py-1.5 text-[11px] text-ivory-50/70 backdrop-blur-md">
                {t('home.journey.hint')}
              </p>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ============ CHAPTER CARDS ============ */}
      <section className="container-wide py-24 md:py-32">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t('home.chapters.eyebrow')}</p>
            <h2 className="headline mt-4 text-4xl md:text-5xl">
              {t('home.chapters.title')}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {JOURNEYS.map((j, i) => (
            <Reveal key={j.slug} delay={(i % 3) * 0.06}>
              <Link
                to={`/journey/${j.slug}`}
                className={`group flex h-full flex-col overflow-hidden rounded-2xl card-earth ${
                  j.spotlight ? 'ring-1 ring-ochre/40' : ''
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {media[j.slug]?.cover ? (
                    <img
                      src={media[j.slug]!.cover!}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-[1.6s] ease-organic group-hover:scale-105"
                    />
                  ) : (
                    <div className="shimmer h-full w-full" />
                  )}
                  <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ivory-50/90 font-display text-sm font-semibold text-forest-deep backdrop-blur-sm">
                    {j.day}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[10px] uppercase tracking-widest-2 text-forest-mist">
                    {t('home.chapters.day', { n: j.day })}
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-charcoal">
                    {j.location[lang]}
                  </h3>
                  <p className="mt-0.5 text-xs italic text-charcoal-soft">
                    {j.region[lang]}
                  </p>
                  <p className="mt-3 flex-1 text-pretty leading-cn text-sm text-charcoal-soft">
                    {j.intro[lang]}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-forest-mist">
                      {media[j.slug]?.speciesCount
                        ? t('home.chapters.species', {
                            count: media[j.slug]!.speciesCount,
                          })
                        : j.date}
                    </span>
                    <span className="link-underline inline-flex items-center gap-1 text-sm font-medium text-forest">
                      {t('home.chapters.openJournal')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ BRIDGE INTO LIFE DATA ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bark-dark via-forest-deep to-forest" />
        <div className="container-wide relative z-10 py-24 md:py-36">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-sage">{t('home.bridge.eyebrow')}</p>
            <h2 className="headline mt-4 text-4xl text-ivory-50 md:text-6xl">
              {t('home.bridge.title')}
            </h2>
            <p className="mt-6 max-w-xl leading-cn text-ivory-50/75">
              {t('home.bridge.body')}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <BridgeCard
              to="/life-data/explore"
              icon={<GitBranch className="h-5 w-5" />}
              title={t('lifeData.explore')}
              desc={t('lifeData.exploreDesc')}
            />
            <BridgeCard
              to="/life-data/map"
              icon={<MapPin className="h-5 w-5" />}
              title={t('lifeData.map')}
              desc={t('lifeData.mapDesc')}
            />
            <BridgeCard
              to="/life-data/stats"
              icon={<BarChart3 className="h-5 w-5" />}
              title={t('lifeData.stats')}
              desc={t('lifeData.statsDesc')}
            />
          </div>

          <Reveal delay={0.1}>
            <Link
              to="/life-data/explore"
              className="group mt-12 inline-flex items-center gap-2 rounded-full bg-ivory-50 px-8 py-4 text-sm font-medium text-forest-deep transition-all duration-500 ease-organic hover:bg-ivory-100"
            >
              {t('home.bridge.cta1')}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function BridgeCard({
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
      className="group rounded-2xl border border-ivory-50/15 bg-ivory-50/5 p-6 backdrop-blur-sm transition-colors duration-500 hover:bg-ivory-50/10"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory-50/10 text-ochre">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl text-ivory-50">{title}</h3>
      <p className="mt-1 text-sm leading-cn text-ivory-50/60">{desc}</p>
    </Link>
  )
}
