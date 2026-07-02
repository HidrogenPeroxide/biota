import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LazyImage } from '@/components/motion/LazyImage'
import { useT } from '@/i18n'

export interface HeroSlide {
  url: string
  credit?: string
  observer?: string
  caption?: string
  common?: string
  scientific?: string
}

/**
 * Full-bleed documentary hero slideshow. Each image slowly zooms (Ken Burns)
 * and cross-fades into the next with a long, organic dissolve.
 */
export function HeroSlideshow({
  slides,
  active = true,
}: {
  slides: HeroSlide[]
  /** Only auto-advance while the hero is on screen (pauses the timer when the
   *  chapter is hidden, so it can't run in the background). */
  active?: boolean
}) {
  const t = useT()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active || slides.length <= 1) return
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      7000,
    )
    return () => clearInterval(id)
  }, [slides.length, active])

  if (!slides.length) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest-deep to-bark-dark" />
    )
  }

  const slide = slides[index]

  return (
    <div className="absolute inset-0 overflow-hidden bg-forest-deep">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <LazyImage
            src={slide.url}
            alt={slide.caption ?? ''}
            ratioClassName="absolute inset-0"
            className="animate-slow-pan"
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic vignette + readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/25 to-charcoal/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/50 to-transparent" />

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1 rounded-full transition-all duration-700 ease-organic"
              style={{
                width: i === index ? 36 : 12,
                background:
                  i === index ? 'rgba(246,242,232,0.9)' : 'rgba(246,242,232,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* Credit (only when an observer/credit is provided — e.g. live
          iNaturalist slides; local photo slides have none) */}
      {(() => {
        const name = slide.observer || slide.credit
        if (!name) return null
        return (
          <div className="absolute bottom-6 right-6 z-10 max-w-[60%] text-right text-[11px] uppercase tracking-widest-2 text-ivory-50/55">
            {t('label.observedBy', { name })}
          </div>
        )
      })()}
    </div>
  )
}
