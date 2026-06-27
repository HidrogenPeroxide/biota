import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  CalendarDays,
  Thermometer,
  Mountain,
  Sparkles,
} from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { LazyImage } from '@/components/motion/LazyImage'
import { Skeleton } from '@/components/ui/skeleton'
import { getJourney, JOURNEYS } from '@/data/journeys'
import { useJourneyCover, useJourneySpecies } from '@/hooks/useJourneyMedia'
import { photoUrl, pickPhoto } from '@/lib/photos'
import { formatCompact } from '@/lib/utils'
import { useI18n, useT } from '@/i18n'

const ease = [0.22, 1, 0.36, 1] as const

export function JourneyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const t = useT()
  const { lang } = useI18n()
  const journey = slug ? getJourney(slug) : undefined

  // Live imagery + species for this location.
  const { cover, speciesCount } = useJourneyCover(
    journey?.slug ?? '',
    journey?.coords ?? [0, 0],
    journey?.date,
  )
  const species = useJourneySpecies(journey?.coords ?? [0, 0], journey?.date)

  if (!journey) {
    return (
      <PageTransition>
        <div className="container-wide pt-[72px]">
          <div className="py-24 text-center">
            <h1 className="headline text-4xl">{t('journey.notFound')}</h1>
            <p className="mt-3 leading-cn text-charcoal-soft">
              {t('journey.notFoundBody')}
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3 text-sm font-medium text-ivory-50 hover:bg-forest-light"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('journey.back')}
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Prev / next chapters.
  const idx = JOURNEYS.findIndex((j) => j.slug === journey.slug)
  const prev = idx > 0 ? JOURNEYS[idx - 1] : null
  const next = idx < JOURNEYS.length - 1 ? JOURNEYS[idx + 1] : null

  return (
    <PageTransition>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[78vh] items-end overflow-hidden">
        {cover ? (
          <motion.img
            key={cover}
            src={cover}
            alt=""
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Skeleton className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-charcoal/20" />

        <div className="container-wide relative z-10 pb-14 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.2 }}
          >
            <Link
              to="/#journey"
              className="inline-flex items-center gap-2 text-sm text-ivory-50/80 transition-colors hover:text-ivory-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('journey.back')}
            </Link>
            <p className="mt-6 text-xs font-medium uppercase tracking-widest-2 text-ochre">
              {t('journey.day', { n: journey.day })}
            </p>
            <h1 className="mt-2 font-display text-5xl font-light leading-[1.1] text-ivory-50 md:text-7xl">
              {journey.location[lang]}
            </h1>
            <p className="mt-3 text-pretty leading-cn text-lg text-ivory-50/85">
              {journey.intro[lang]}
            </p>

            {/* Meta strip */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ivory-50/75">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-sage" />
                {journey.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-sage" />
                {journey.weather.tempC}° · {journey.weather.condition[lang]}
              </span>
              {journey.elevation && (
                <span className="inline-flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-sage" />
                  {t('journey.elevation')} {journey.elevation} m
                </span>
              )}
              {speciesCount > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sage" />
                  {formatCompact(speciesCount)} {lang === 'zh' ? '物种' : 'species'}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ BODY ============ */}
      <div className="container-narrow space-y-20 py-20 md:space-y-28 md:py-28">
        {/* Diary */}
        <section>
          <Reveal>
            <p className="eyebrow">{t('journey.diary')}</p>
          </Reveal>
          <div className="mt-6 space-y-6">
            {journey.diary.map((para, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className="text-pretty leading-cn text-xl text-charcoal-soft">
                  {para[lang]}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Memorable moments */}
        <section>
          <Reveal>
            <p className="eyebrow">{t('journey.moments')}</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {journey.moments.map((m, i) => (
                <Reveal as="li" key={i} delay={0.05 * i}>
                  <div className="flex items-start gap-3 rounded-2xl border border-stone-light/70 bg-ivory-50 p-5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
                    <span className="leading-cn text-charcoal-soft">{m[lang]}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* Species observed this day (live) */}
        <section>
          <Reveal>
            <p className="eyebrow">{t('journey.speciesTitle')}</p>
            <h2 className="headline mt-3 text-3xl md:text-4xl">
              {journey.location[lang]}
            </h2>
            <p className="mt-3 leading-cn text-charcoal-soft">
              {t('journey.speciesBody')}
            </p>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {!species ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))
            ) : species.length === 0 ? (
              <p className="col-span-full py-8 text-sm leading-cn text-charcoal-soft">
                {t('species.galleryEmpty')}
              </p>
            ) : (
              species
                .filter((o) => o.taxon && o.photos?.[0])
                .slice(0, 12)
                .map((o, i) => (
                  <Reveal key={o.id} delay={(i % 4) * 0.05}>
                    <Link
                      to={`/life-data/species/${o.taxon!.id}`}
                      className="group block overflow-hidden rounded-2xl card-earth"
                    >
                      <LazyImage
                        src={photoUrl(pickPhoto(o.photos![0], 'large'), 'large')}
                        alt={o.taxon!.preferred_common_name || o.taxon!.name}
                        ratioClassName="aspect-square"
                        zoom
                      />
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-charcoal">
                          {o.taxon!.preferred_common_name || o.taxon!.name}
                        </p>
                        <p className="truncate text-xs italic text-charcoal-soft">
                          {o.taxon!.name}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))
            )}
          </div>
        </section>
      </div>

      {/* ============ BRIDGE INTO LIFE DATA ============ */}
      <section className="bg-forest-deep py-20 text-ivory-50 md:py-28">
        <div className="container-narrow text-center">
          <Reveal>
            <MapPin className="mx-auto h-8 w-8 text-ochre" strokeWidth={1.3} />
            <h2 className="headline mx-auto mt-5 max-w-2xl text-3xl text-ivory-50 md:text-4xl">
              {t('journey.speciesTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-cn text-ivory-50/70">
              {t('home.bridge.body')}
            </p>
            <Link
              to={`/life-data/explore?lat=${journey.coords[0]}&lng=${journey.coords[1]}&radius=50&place=${encodeURIComponent(
                journey.location[lang],
              )}`}
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-ivory-50 px-8 py-4 text-sm font-medium text-forest-deep transition-all duration-500 ease-organic hover:bg-ivory-100"
            >
              {t('journey.exploreFromHere')}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ PREV / NEXT ============ */}
      <nav className="container-wide flex flex-col gap-4 py-12 sm:flex-row sm:justify-between">
        {prev ? (
          <Link
            to={`/journey/${prev.slug}`}
            className="group inline-flex items-center gap-3 text-left"
          >
            <ArrowLeft className="h-5 w-5 text-forest transition-transform duration-500 group-hover:-translate-x-1" />
            <span>
              <span className="block text-xs text-forest-mist">
                {t('journey.day', { n: prev.day })}
              </span>
              <span className="block font-display text-lg text-charcoal">
                {prev.location[lang]}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/journey/${next.slug}`}
            className="group inline-flex items-center gap-3 text-right"
          >
            <span>
              <span className="block text-xs text-forest-mist">
                {t('journey.day', { n: next.day })}
              </span>
              <span className="block font-display text-lg text-charcoal">
                {next.location[lang]}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-forest transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        ) : null}
      </nav>
    </PageTransition>
  )
}
