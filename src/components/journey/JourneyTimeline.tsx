import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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

const ease = [0.22, 1, 0.36, 1] as const

/**
 * The narrative backbone of the homepage — the timeline IS the expedition.
 *
 * Interactions (all produce the same result — one synchronized day change):
 *  • horizontal swipe / mouse-drag on the main area
 *  • horizontal mouse wheel (or Shift + wheel)
 *  • ← / → arrow keys (when the chapter is active)
 *  • click any timeline node
 *  • drag the bottom strip itself (with momentum / inertial scrolling)
 *
 * On every change, the hero image (fade+scale+blur), the journal text
 * (fade+rise), the animated gold progress line (extends forward / retracts),
 * and the shared-layout indicator ring all move together.
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
  const curRef = useRef(0)
  curRef.current = cur
  const clamp = (c: number) => Math.max(0, Math.min(n - 1, c))
  const goTo = (c: number) => setCur(clamp(c))

  const j = journeys[cur]
  const dayLabel = lang === 'zh' ? `第 ${j.day} 天` : `Day ${j.day}`
  const paragraphs = j.diary.slice(0, 2)
  const cover = media[j.slug]?.cover ?? null
  const species = media[j.slug]?.speciesCount ?? 0

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
      if (Math.abs(dx) < 6) return // leave vertical scrolling to the deck
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
  const strip = useRef({
    down: false,
    x: 0,
    moved: false,
    vx: 0,
    raf: 0,
  })
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
    const track = trackRef.current
    strip.current = {
      down: true,
      x: e.clientX,
      moved: false,
      vx: 0,
      raf: 0,
    }
    void track
  }
  const onStripMove = (e: React.PointerEvent) => {
    const track = trackRef.current
    if (!track || !strip.current.down) return
    const dx = e.clientX - strip.current.x
    if (Math.abs(dx) > 4) strip.current.moved = true
    const prev = track.scrollLeft
    track.scrollLeft = strip.current.x ? prev - (e.clientX - lastPointerX.current) : prev
    lastPointerX.current = e.clientX
    strip.current.vx = track.scrollLeft - prev // per-event scroll delta
    strip.current.x = e.clientX
  }
  const lastPointerX = useRef(0)
  const onStripUp = () => {
    if (!strip.current.down) return
    strip.current.down = false
    if (Math.abs(strip.current.vx) > 1) startMomentum(strip.current.vx)
  }
  useEffect(() => () => stopMomentum(), [])

  return (
    <div
      ref={rootRef}
      className="flex h-full select-none flex-col py-14 md:py-20"
    >
      {/* ===== main area (swipeable) ===== */}
      <div
        className="container-wide flex flex-1 cursor-grab flex-col gap-6 md:grid md:grid-cols-[3fr_2fr] md:items-center md:gap-12 md:pb-4"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onSwipeDown}
        onPointerUp={onSwipeUp}
        onPointerCancel={() => (swipe.current.active = false)}
      >
        {/* ---- Left: editorial photograph ---- */}
        <div className="relative h-[38vh] min-h-[220px] overflow-hidden rounded-[20px] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] md:h-[62vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={j.slug}
              src={cover ?? undefined}
              alt={j.location[lang]}
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
              transition={{ duration: 0.7, ease }}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          {!cover && <div className="shimmer absolute inset-0" />}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-ivory-50/90 font-display text-base font-semibold text-forest-deep backdrop-blur-sm">
            {j.day}
          </span>
        </div>

        {/* ---- Right: field-journal text ---- */}
        <div className="flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={j.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="eyebrow text-ochre">{dayLabel}</p>
              <h3 className="headline mt-3 text-4xl text-ivory-50 md:text-5xl">
                {j.location[lang]}
              </h3>
              <p className="mt-2 text-sm italic text-ivory-50/55">
                {j.region[lang]} · {j.date}
                {species > 0 &&
                  ` · ${formatCompact(species)} ${lang === 'zh' ? '物种' : 'species'}`}
              </p>
              <div className="mt-6 max-w-prose space-y-4">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-pretty leading-cn text-[15px] text-ivory-50/80"
                  >
                    {p[lang]}
                  </p>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to={`/journey/${j.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-ochre/50 px-7 py-3 text-sm font-medium text-ochre transition-all duration-500 ease-organic hover:bg-ochre hover:text-charcoal"
                >
                  {t('home.journey.readStory')}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== bottom timeline strip ===== */}
      <div className="container-wide mt-6 md:mt-8">
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
                    <div className="relative h-px w-full bg-ivory-50/12">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-ochre"
                        initial={false}
                        animate={{ width: i <= cur ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease }}
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
                  {/* dot row — fixed height so the connecting line aligns */}
                  <span className="relative flex h-5 w-full items-center justify-center">
                    {isCur && (
                      <motion.span
                        layoutId="tl-ring"
                        className="absolute h-8 w-8 rounded-full bg-ochre/20 ring-1 ring-ochre/70"
                        transition={{ duration: 0.55, ease }}
                      />
                    )}
                    <span
                      className={cn(
                        'relative rounded-full transition-colors duration-300',
                        isCur
                          ? 'h-4 w-4 bg-ochre'
                          : isPast
                            ? 'h-2.5 w-2.5 bg-ochre/85'
                            : 'h-2.5 w-2.5 bg-ivory-50/25',
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      'mt-2 whitespace-nowrap text-[10px] uppercase tracking-widest-2 transition-colors duration-300',
                      isCur ? 'text-ochre' : isPast ? 'text-ivory-50/55' : 'text-ivory-50/30',
                    )}
                  >
                    {lang === 'zh' ? `第${jj.day}天` : `Day ${jj.day}`}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 hidden max-w-[64px] truncate text-[10px] transition-colors duration-300 lg:block',
                      isCur ? 'text-ivory-50/80' : isPast ? 'text-ivory-50/40' : 'text-ivory-50/25',
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
