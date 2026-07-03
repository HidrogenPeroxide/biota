import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, ArrowDown, MapPin, BarChart3, GitBranch, X } from 'lucide-react'
import { HeroSlideshow } from '@/components/shared/HeroSlideshow'
import { JourneyMap } from '@/components/journey/JourneyMap'
import { JourneyTimeline } from '@/components/journey/JourneyTimeline'
import { HERO_SLIDES } from '@/data/heroSlides'
import { useAllJourneyMedia } from '@/hooks/useJourneyMedia'
import { JOURNEYS, type Journey } from '@/data/journeys'
import { useI18n, useT } from '@/i18n'
import { setNavTheme } from '@/lib/navTheme'

const ease = [0.22, 1, 0.36, 1] as const
const CHAPTERS = 4
const TRANSITION = 1100 // ms — cinematic, within the 700–1200ms band

/* Full-screen chapter transitions: opacity fade + gentle scale + rise. */
const sectionVar: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 32 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: TRANSITION / 1000, ease },
  },
}
/* Staggered inner reveals (hero lines, chapter cards). */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

export function Landing() {
  const t = useT()
  const { lang } = useI18n()
  const media = useAllJourneyMedia()
  const [selected, setSelected] = useState<Journey | null>(null)

  /* ---- presentation deck: one chapter at a time ---- */
  const [index, setIndex] = useState(0)
  // The Travel Journey chapter is light-themed → switch the navbar to a solid
  // dark-text variant while it's on screen (and restore on leaving the deck).
  useEffect(() => {
    setNavTheme(index === 2 ? 'light' : 'dark')
    return () => setNavTheme('dark')
  }, [index])
  const indexRef = useRef(0)
  const lockedRef = useRef(false)
  const pendingRef = useRef(0) // queued direction while a transition runs
  const deckRef = useRef<HTMLDivElement>(null)
  const touchYRef = useRef<number | null>(null)
  // Wheel de-bounce: one continuous scroll gesture = one page turn only.
  const armedRef = useRef(true)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goTo = (target: number) => {
    const clamped = Math.max(0, Math.min(CHAPTERS - 1, target))
    if (clamped === indexRef.current || lockedRef.current) return
    lockedRef.current = true
    pendingRef.current = 0
    indexRef.current = clamped
    setIndex(clamped)
    window.setTimeout(() => {
      lockedRef.current = false
      if (pendingRef.current !== 0) {
        const dir = pendingRef.current
        pendingRef.current = 0
        advance(dir)
      }
    }, TRANSITION)
  }
  const advance = (dir: number) => {
    if (lockedRef.current) {
      pendingRef.current = dir // queue the intent; applied when current ends
      return
    }
    goTo(indexRef.current + dir)
  }

  useEffect(() => {
    const deck = deckRef.current
    if (!deck) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 8) return
      // A single physical scroll fires many events; treat the whole burst as
      // one gesture: fire once, then re-arm only after the wheel goes quiet.
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        armedRef.current = true
      }, 200)
      if (!armedRef.current) return
      armedRef.current = false
      advance(e.deltaY > 0 ? 1 : -1)
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        advance(1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        advance(-1)
      }
    }
    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      // Stop the browser from rubber-banding the page.
      if (touchYRef.current !== null) e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (touchYRef.current === null) return
      const dy = e.changedTouches[0].clientY - touchYRef.current
      touchYRef.current = null
      if (Math.abs(dy) > 45) advance(dy < 0 ? 1 : -1)
    }
    deck.addEventListener('wheel', onWheel, { passive: false })
    deck.addEventListener('touchmove', onTouchMove, { passive: false })
    deck.addEventListener('touchstart', onTouchStart, { passive: true })
    deck.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      deck.removeEventListener('wheel', onWheel)
      deck.removeEventListener('touchmove', onTouchMove)
      deck.removeEventListener('touchstart', onTouchStart)
      deck.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div
      ref={deckRef}
      className="fixed inset-0 overflow-hidden bg-forest-deep"
      style={{ touchAction: 'none' }}
    >
      {/* ============ 1 · HERO ============ */}
      <motion.section
        variants={sectionVar}
        initial="hidden"
        animate={index === 0 ? 'show' : 'hidden'}
        className="absolute inset-0 flex items-center overflow-hidden"
        style={{ pointerEvents: index === 0 ? 'auto' : 'none' }}
      >
        <HeroSlideshow slides={HERO_SLIDES} active={index === 0} />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={index === 0 ? 'show' : 'hidden'}
          className="container-wide relative z-10 pt-24"
        >
          <motion.h1
            variants={item}
            className="font-display text-[2.6rem] font-light leading-[1.12] tracking-tight text-ivory-50 sm:text-6xl md:text-7xl lg:text-[5.2rem]"
          >
            {t('home.story.title1')}
            <br />
            <span className="accent text-ochre">{t('home.story.titleAccent')}</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-balance leading-cn text-lg text-ivory-50/85"
          >
            {t('home.story.subtitle')}
            {t('home.story.subtitleAttribution') && (
              <span className="mt-3 block text-base not-italic text-ivory-50/55">
                {t('home.story.subtitleAttribution')}
              </span>
            )}
          </motion.p>
        </motion.div>

        {index === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory-50/60"
          >
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.span>
          </motion.div>
        )}
      </motion.section>

      {/* ============ 2 · JOURNEY MAP ============ */}
      <motion.section
        variants={sectionVar}
        initial="hidden"
        animate={index === 1 ? 'show' : 'hidden'}
        className="absolute inset-0 bg-forest-deep"
        style={{ pointerEvents: index === 1 ? 'auto' : 'none' }}
      >
        <JourneyMap
          journeys={JOURNEYS}
          media={media}
          selectedSlug={selected?.slug ?? null}
          onSelect={setSelected}
          lang={lang}
          active={index === 1}
          className="absolute inset-0 h-full w-full"
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={index === 1 ? 'show' : 'hidden'}
          className="pointer-events-none absolute left-0 top-[88px] z-[650] container-wide"
        >
          <motion.p variants={item} className="eyebrow text-sage">
            {t('home.journey.eyebrow')}
          </motion.p>
          <motion.h2
            variants={item}
            className="headline mt-2 max-w-md text-3xl text-ivory-50 md:text-4xl"
          >
            {t('home.journey.title')}
          </motion.h2>
        </motion.div>

        {/* Slide-in preview panel for the selected day */}
        {selected && (
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="absolute bottom-5 right-5 top-[88px] z-[660] flex w-[78vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-ivory-50/15 bg-charcoal/80 backdrop-blur-xl md:w-96"
          >
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/70 text-ivory-50/80 backdrop-blur-md transition-colors hover:bg-charcoal/90 hover:text-ivory-50"
            >
              <X className="h-4 w-4" />
            </button>
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
                  className="group pointer-events-auto inline-flex items-center gap-2 text-sm font-medium text-ochre"
                >
                  {t('home.journey.readStory')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* ============ 3 · TIMELINE STORY ============ */}
      <motion.section
        variants={sectionVar}
        initial="hidden"
        animate={index === 2 ? 'show' : 'hidden'}
        className="absolute inset-0 overflow-hidden bg-ivory"
        style={{ pointerEvents: index === 2 ? 'auto' : 'none' }}
      >
        <JourneyTimeline
          journeys={JOURNEYS}
          media={media}
          lang={lang}
          active={index === 2}
        />
      </motion.section>

      {/* ============ 4 · ENTER LIFE DATA ============ */}
      <motion.section
        variants={sectionVar}
        initial="hidden"
        animate={index === 3 ? 'show' : 'hidden'}
        className="absolute inset-0 flex items-center overflow-hidden"
        style={{ pointerEvents: index === 3 ? 'auto' : 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-bark-dark via-forest-deep to-forest" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={index === 3 ? 'show' : 'hidden'}
          className="container-wide relative z-10"
        >
          <motion.p variants={item} className="eyebrow text-sage">
            {t('home.bridge.eyebrow')}
          </motion.p>
          <motion.h2
            variants={item}
            className="headline mt-4 max-w-3xl text-4xl text-ivory-50 md:text-6xl"
          >
            {t('home.bridge.title')}
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-6 max-w-xl leading-cn text-ivory-50/75"
          >
            {t('home.bridge.body')}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 grid gap-5 sm:grid-cols-3"
          >
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
          </motion.div>

          <motion.div
            variants={item}
            custom={1}
            className="mt-12"
          >
            <Link
              to="/life-data/explore"
              className="group inline-flex items-center gap-2 rounded-full bg-ivory-50 px-8 py-4 text-sm font-medium text-forest-deep transition-all duration-500 ease-organic hover:bg-ivory-100"
            >
              {t('home.bridge.cta1')}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Chapter progress dots */}
      <div className="pointer-events-auto absolute right-5 top-1/2 z-[800] hidden -translate-y-1/2 flex-col gap-2.5 md:flex">
        {Array.from({ length: CHAPTERS }).map((_, i) => (
          <button
            key={i}
            aria-label={`Chapter ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-500 ease-organic ${
              i === index
                ? 'h-6 w-1.5 bg-ochre'
                : 'h-1.5 w-1.5 bg-ivory-50/40 hover:bg-ivory-50/70'
            }`}
          />
        ))}
      </div>
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
