import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { Journey } from '@/data/journeys'
import type { Lang } from '@/i18n'
import { useT } from '@/i18n'
import { formatCompact, cn } from '@/lib/utils'

interface JourneyMedia {
  cover: string | null
  speciesCount: number
}

interface JourneyTimelineProps {
  journeys: Journey[]
  media: Record<string, JourneyMedia>
  lang: Lang
  active?: boolean
}

/* Physical stack-slide transition: forward → current drifts out to the left,
 * the next card steps forward from the stack; backward reverses it. */
const cardVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 64 : -64,
    y: 20,
    scale: 0.92,
    opacity: 0,
    rotate: dir >= 0 ? 1.6 : -1.6,
  }),
  center: { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 },
  exit: (dir: number) => ({
    x: dir >= 0 ? -64 : 64,
    y: -14,
    scale: 0.94,
    opacity: 0,
    rotate: dir >= 0 ? -1.6 : 1.6,
  }),
}
const cardSpring = { type: 'spring', stiffness: 240, damping: 30, mass: 0.9 }
const textEase = [0.22, 1, 0.36, 1] as const
// A motion-enabled Link so the photo card can animate (incl. exit) AND navigate.
const MotionLink = motion(Link)

/**
 * The narrative backbone of the homepage — a light, editorial expedition
 * journal. Left: the day's story. Right: the hero photograph as a floating
 * card with the next chapters peeking behind it. Bottom: the timeline.
 *
 * All interactions (swipe / drag / wheel / click / ←→) and the synchronized
 * day-change animation are preserved; this is purely the layout & visuals.
 */
export function JourneyTimeline({
  journeys,
  media,
  lang,
  active = false,
}: JourneyTimelineProps) {
  const t = useT()
  const n = journeys.length
  const [cur, setCur] = useState(0)
  const [dir, setDir] = useState(1)
  const curRef = useRef(0)
  curRef.current = cur
  const clamp = (c: number) => Math.max(0, Math.min(n - 1, c))
  const goTo = (c: number) => {
    const next = clamp(c)
    if (next === cur) return
    setDir(next > cur ? 1 : -1)
    setCur(next)
  }

  const j = journeys[cur]
  const dayLabel = lang === 'zh' ? `第 ${j.day} 天` : `Day ${j.day}`
  const paragraphs = j.diary.slice(0, 2)
  const cover = media[j.slug]?.cover ?? null
  const species = media[j.slug]?.speciesCount ?? 0
  const peeks = [1, 2]
    .map((k) => (cur + k < n ? journeys[cur + k] : null))
    .filter(Boolean) as Journey[]

  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<number, HTMLElement>>(new Map())

  /* ---- keyboard ←/→ (only while this chapter is active) ---- */
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(curRef.current + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(curRef.current - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  /* ---- horizontal wheel (deltaX or Shift+wheel) ---- */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let armed = true
    let idle: ReturnType<typeof setTimeout>
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : 0
      if (Math.abs(dx) < 6) return
      e.preventDefault()
      e.stopPropagation()
      clearTimeout(idle)
      idle = setTimeout(() => (armed = true), 220)
      if (!armed) return
      armed = false
      goTo(curRef.current + (dx > 0 ? 1 : -1))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(idle)
    }
  }, [])

  /* ---- auto-center the active node after a change ---- */
  useEffect(() => {
    const track = trackRef.current
    const node = nodeRefs.current.get(cur)
    if (!track || !node) return
    const target = node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2
    track.scrollTo({ left: target, behavior: 'smooth' })
  }, [cur])

  /* ---- whole-area horizontal swipe (pointer) ---- */
  const swipe = useRef({ x: 0, y: 0, active: false })
  const onSwipeDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, active: true }
  }
  const onSwipeUp = (e: React.PointerEvent) => {
    if (!swipe.current.active) return
    const dx = e.clientX - swipe.current.x
    const dy = e.clientY - swipe.current.y
    swipe.current.active = false
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      goTo(curRef.current + (dx < 0 ? 1 : -1))
    }
  }

  /* ---- draggable strip with momentum / inertia ---- */
  const strip = useRef({ down: false, x: 0, moved: false, vx: 0, raf: 0 })
  const lastPointerX = useRef(0)
  const stopMomentum = () => {
    if (strip.current.raf) {
      cancelAnimationFrame(strip.current.raf)
      strip.current.raf = 0
    }
  }
  const startMomentum = (v: number) => {
    const tick = () => {
      const track = trackRef.current
      if (!track) return
      v *= 0.92
      track.scrollLeft += v
      strip.current.raf = Math.abs(v) > 0.5 ? requestAnimationFrame(tick) : 0
    }
    strip.current.raf = requestAnimationFrame(tick)
  }
  const onStripDown = (e: React.PointerEvent) => {
    stopMomentum()
    strip.current = { down: true, x: e.clientX, moved: false, vx: 0, raf: 0 }
    lastPointerX.current = e.clientX
  }
  const onStripMove = (e: React.PointerEvent) => {
    const track = trackRef.current
    if (!track || !strip.current.down) return
    if (Math.abs(e.clientX - strip.current.x) > 4) strip.current.moved = true
    const prev = track.scrollLeft
    track.scrollLeft = prev - (e.clientX - lastPointerX.current)
    lastPointerX.current = e.clientX
    strip.current.vx = track.scrollLeft - prev
    strip.current.x = e.clientX
  }
  const onStripUp = () => {
    if (!strip.current.down) return
    strip.current.down = false
    if (Math.abs(strip.current.vx) > 1) startMomentum(strip.current.vx)
  }
  useEffect(() => () => stopMomentum(), [])

  return (
    <div
      ref={rootRef}
      className="timeline-paper relative flex h-full select-none flex-col bg-ivory py-14 md:py-20"
    >
      <div className="container-wide grid flex-1 gap-8 md:grid-cols-[5fr_7fr] md:items-center md:gap-14">
        {/* ===== Left: field-journal text ===== */}
        <div
          className="order-2 flex flex-col justify-center pb-10 md:order-1 md:pb-24"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onSwipeDown}
          onPointerUp={onSwipeUp}
          onPointerCancel={() => (swipe.current.active = false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={j.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: textEase }}
            >
              <p className="eyebrow hidden text-ochre md:block">
                {t('journey.fieldJournal')}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-2xl font-medium text-ochre">
                  {dayLabel}
                </span>
                <span className="hidden h-px flex-1 bg-stone-light md:block" />
              </div>
              <h3 className="headline mt-3 text-4xl text-charcoal md:text-5xl">
                {j.location[lang]}
              </h3>
              <p className="mt-2 hidden text-sm italic text-charcoal-soft md:block">
                {j.region[lang]} · {j.date}
                {species > 0 &&
                  ` · ${formatCompact(species)} ${lang === 'zh' ? '物种' : 'species'}`}
              </p>

              <div className="mt-6 hidden max-w-prose space-y-4 md:block">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-pretty leading-cn text-[15px] text-charcoal-soft"
                  >
                    {p[lang]}
                  </p>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ===== Right: floating photo card + stacked preview ===== */}
        <div
          className="relative order-1 h-[40vh] min-h-[240px] cursor-grab md:order-2 md:h-[66vh] active:cursor-grabbing"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onSwipeDown}
          onPointerUp={onSwipeUp}
          onPointerCancel={() => (swipe.current.active = false)}
        >
          {/* peek cards behind — the journey continues */}
          {peeks.map((pj, k) => {
            const pk = k + 1
            const pcover = media[pj.slug]?.cover
            return (
              <div
                key={pj.slug}
                className="absolute inset-0 overflow-hidden rounded-[20px] border border-stone-light/60 bg-ivory-100 shadow-[0_24px_50px_-30px_rgba(38,36,31,0.4)]"
                style={{
                  transform: `translate(${pk * 16}px, ${pk * 16}px) scale(${1 - pk * 0.05})`,
                  opacity: 0.55 - k * 0.25,
                  zIndex: 20 - pk,
                }}
              >
                {pcover && (
                  <img
                    src={pcover}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            )
          })}

          {/* active photo card — click to read the full journal */}
          <AnimatePresence custom={dir} initial={false}>
            <MotionLink
              to={`/journey/${j.slug}`}
              key={j.slug}
              custom={dir}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={cardSpring}
              className="absolute inset-0 z-30 cursor-pointer overflow-hidden rounded-[20px] border border-stone-light/70 bg-ivory-100 shadow-[0_40px_80px_-34px_rgba(38,36,31,0.55)]"
            >
              <motion.img
                key={cover ?? 'none'}
                src={cover ?? undefined}
                alt={j.location[lang]}
                draggable={false}
                initial={{ scale: 1.06, filter: 'blur(6px)' }}
                animate={{ scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: textEase }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {!cover && <div className="shimmer absolute inset-0" />}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-charcoal/65 font-display text-base font-semibold text-ivory-50 backdrop-blur-sm">
                {j.day}
              </span>
            </MotionLink>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== bottom timeline strip (desktop only — mobile uses swipe) ===== */}
      <div className="container-wide mt-6 hidden md:mt-8 md:block">
        <div
          ref={trackRef}
          onPointerDown={onStripDown}
          onPointerMove={onStripMove}
          onPointerUp={onStripUp}
          onPointerLeave={onStripUp}
          onPointerCancel={onStripUp}
          className="relative flex cursor-grab items-start overflow-x-auto pb-2 active:cursor-grabbing"
          style={{ touchAction: 'pan-x', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {journeys.map((jj, i) => {
            const isCur = i === cur
            const isPast = i < cur
            return (
              <Fragment key={jj.slug}>
                {i > 0 && (
                  <div className="flex h-5 min-w-[24px] flex-1 items-center md:min-w-[40px]">
                    <div className="relative h-px w-full bg-charcoal/10">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-ochre"
                        initial={false}
                        animate={{ width: i <= cur ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: textEase }}
                      />
                    </div>
                  </div>
                )}
                <button
                  ref={(el) => {
                    if (el) nodeRefs.current.set(i, el)
                  }}
                  onClick={() => {
                    if (!strip.current.moved) goTo(i)
                  }}
                  className="flex w-12 shrink-0 flex-col items-center md:w-16"
                  aria-label={`${lang === 'zh' ? '第' : 'Day'} ${jj.day}`}
                >
                  <span className="relative flex h-5 w-full items-center justify-center">
                    {isCur && (
                      <motion.span
                        layoutId="tl-ring"
                        className="absolute h-8 w-8 rounded-full bg-ochre/20 ring-1 ring-ochre/60"
                        transition={{ duration: 0.55, ease: textEase }}
                      />
                    )}
                    <span
                      className={cn(
                        'relative rounded-full transition-colors duration-300',
                        isCur
                          ? 'h-4 w-4 bg-ochre'
                          : isPast
                            ? 'h-2.5 w-2.5 bg-ochre/85'
                            : 'h-2.5 w-2.5 bg-charcoal/20',
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      'mt-2 whitespace-nowrap text-[10px] uppercase tracking-widest-2 transition-colors duration-300',
                      isCur
                        ? 'text-ochre'
                        : isPast
                          ? 'text-charcoal/55'
                          : 'text-charcoal/30',
                    )}
                  >
                    {lang === 'zh' ? `第${jj.day}天` : `Day ${jj.day}`}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 hidden max-w-[64px] truncate text-[10px] transition-colors duration-300 lg:block',
                      isCur
                        ? 'text-charcoal/80'
                        : isPast
                          ? 'text-charcoal/40'
                          : 'text-charcoal/25',
                    )}
                  >
                    {jj.location[lang]}
                  </span>
                </button>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
