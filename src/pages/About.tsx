import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { useT } from '@/i18n'
import { fieldNoteStore } from '@/lib/fieldNoteStore'

const ease = [0.22, 1, 0.36, 1] as const

const MEET_ARTICLE_URL = 'https://mp.weixin.qq.com/s/0g-6bDVo0LZMXD8KG9jT6Q'

/**
 * The closing chapter of the site — a calm, documentary-style epilogue.
 * Hero + Acknowledgements. The gold "我们 / Us" in the title links to the
 * team introduction article, with a subtle sage-light ripple easter egg.
 */
export function About() {
  const t = useT()
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null)
  const keyRef = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Discover the hidden "Together" field note (once; no-op after).
    fieldNoteStore.discover('007')
    const rect = e.currentTarget.getBoundingClientRect()
    keyRef.current++
    setRipple({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      key: keyRef.current,
    })
    window.setTimeout(() => {
      window.open(MEET_ARTICLE_URL, '_blank', 'noopener')
    }, 550)
  }

  return (
    <PageTransition>
      <div className="bg-ivory pb-28 pt-[72px]">
        {/* ===== 1 · HERO ===== */}
        <section className="relative flex min-h-[78vh] items-end overflow-hidden">
          <img
            src="/hero/hero-09.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/30" />
          <Reveal className="container-wide relative z-10 pb-16">
            <h1 className="headline text-5xl text-ivory-50 md:text-7xl">
              {t('about.hero.title')}{' '}
              <a
                href={MEET_ARTICLE_URL}
                onClick={handleClick}
                rel="noreferrer"
                className="accent cursor-pointer text-ochre transition-colors duration-500 hover:text-sage-light"
              >
                {t('about.hero.titleAccent')}
              </a>
            </h1>
            <p className="mt-5 max-w-xl text-pretty leading-cn text-lg text-ivory-50/85">
              {t('about.hero.subtitle')}
            </p>
          </Reveal>
        </section>

        {/* Ripple easter egg — sage-light, matching the hover color */}
        <AnimatePresence>
          {ripple && (
            <motion.span
              key={ripple.key}
              className="pointer-events-none fixed z-[2000] rounded-full border"
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%',
                borderColor: 'rgba(168,181,155,0.7)',
              }}
              initial={{ width: 20, height: 20, opacity: 0.7 }}
              animate={{ width: 400, height: 400, opacity: 0 }}
              transition={{ duration: 0.55, ease }}
              onAnimationComplete={() => setRipple(null)}
            />
          )}
        </AnimatePresence>

        {/* ===== 2 · ACKNOWLEDGEMENTS ===== */}
        <section className="container-narrow py-24 md:py-32">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-ochre">{t('about.thanks.eyebrow')}</p>
            <h2 className="headline mt-3 text-3xl text-charcoal md:text-5xl">
              {t('about.thanks.title')}
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease }}
              className="mt-8 text-pretty leading-cn text-base text-charcoal-soft md:text-lg"
            >
              {t('about.thanks.body')}
            </motion.p>
          </Reveal>
        </section>
      </div>
    </PageTransition>
  )
}
