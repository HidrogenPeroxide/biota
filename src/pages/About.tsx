import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { useT } from '@/i18n'
import { fieldNoteStore } from '@/lib/fieldNoteStore'

const ease = [0.22, 1, 0.36, 1] as const

const MEET_ARTICLE_URL = 'https://mp.weixin.qq.com/s/0g-6bDVo0LZMXD8KG9jT6Q'

const FIELD_LOGS = [
  {
    href: 'https://mp.weixin.qq.com/s/Zy9qVvthSVGFSxIsKhCgMw',
    rangeKey: 'about.research.log1.range',
    titleKey: 'about.research.log1.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/PJldCgevB2mLZ1Qnep6ljQ',
    rangeKey: 'about.research.log2.range',
    titleKey: 'about.research.log2.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/hxsebw-s0BJk3CmkhlqJlw',
    rangeKey: 'about.research.log3.range',
    titleKey: 'about.research.log3.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/xsg9gX3NV4IuXhatGPrA-Q',
    rangeKey: 'about.research.log4.range',
    titleKey: 'about.research.log4.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/XOwFDaZfQbU01xNnFt19yg',
    rangeKey: 'about.research.log5.range',
    titleKey: 'about.research.log5.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/j0cCCYUAP3iMYWwupS46EQ',
    rangeKey: 'about.research.log6.range',
    titleKey: 'about.research.log6.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/8lba-ivUDk0e8m9Gv8Gu1Q',
    rangeKey: 'about.research.log7.range',
    titleKey: 'about.research.log7.title',
  },
  {
    href: 'https://mp.weixin.qq.com/s/PwmiUTfZ6xJtUk_qEvA3Og',
    rangeKey: 'about.research.log8.range',
    titleKey: 'about.research.log8.title',
  },
] as const

/**
 * The closing chapter of the site — a calm, documentary-style epilogue.
 * Hero + field research logs. The gold "我们 / Us" in the title links to the
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

        {/* ===== 2 · FIELD RESEARCH ===== */}
        <section className="container-narrow py-24 md:py-32">
          <Reveal className="max-w-4xl">
            <p className="eyebrow text-ochre">{t('about.research.eyebrow')}</p>
            <div className="mt-3 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] md:items-end md:gap-12">
              <h2 className="headline text-3xl text-charcoal md:text-5xl">
                {t('about.research.title')}
              </h2>
              <p className="text-pretty leading-cn text-sm text-charcoal-soft md:text-base">
                {t('about.research.body')}
              </p>
            </div>

            <div className="mt-14 border-t border-charcoal/15">
              {FIELD_LOGS.map((log, index) => (
                <motion.a
                  key={log.href}
                  href={log.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: index * 0.08, ease }}
                  className="group grid min-h-28 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-charcoal/15 py-6 md:grid-cols-[5rem_minmax(0,1fr)_auto] md:gap-8"
                  aria-label={t(log.titleKey)}
                >
                  <span className="font-mono text-xs text-charcoal-soft/60">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="eyebrow text-ochre">{t(log.rangeKey)}</span>
                    <span className="mt-2 block text-lg font-medium text-charcoal transition-colors duration-300 group-hover:text-forest md:text-xl">
                      {t(log.titleKey)}
                    </span>
                  </span>
                  <span className="text-charcoal-soft transition-colors duration-300 group-hover:text-forest">
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </motion.a>
              ))}
            </div>
          </Reveal>
        </section>
      </div>
    </PageTransition>
  )
}
