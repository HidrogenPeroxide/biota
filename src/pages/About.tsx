import { motion } from 'framer-motion'
import { Play, ArrowUpRight } from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { useI18n, useT } from '@/i18n'
import { UPDATES, VLOG } from '@/data/updates'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * The closing chapter of the site — a calm, documentary-style epilogue rather
 * than a corporate "About" page. Five narrative beats: a reflective hero, the
 * expedition vlog, a visual timeline of journey updates, a warm acknowledgement,
 * and a quiet data & credits footer.
 */
export function About() {
  const t = useT()
  const { lang } = useI18n()

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
            <p className="eyebrow text-sage">{t('about.eyebrow')}</p>
            <h1 className="headline mt-4 text-5xl text-ivory-50 md:text-7xl">
              {t('about.hero.title')}
            </h1>
            <p className="mt-5 max-w-xl text-pretty leading-cn text-lg text-ivory-50/85">
              {t('about.hero.subtitle')}
            </p>
          </Reveal>
        </section>

        {/* ===== 2 · BEFORE THE EXPEDITION (VLOG) ===== */}
        <section className="container-narrow py-24 md:py-32">
          <Reveal>
            <p className="eyebrow text-center text-ochre">
              {t('about.vlog.eyebrow')}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <a
              href={VLOG.href || undefined}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-video overflow-hidden rounded-[20px] shadow-[0_40px_80px_-34px_rgba(38,36,31,0.5)]"
            >
              <img
                src={VLOG.cover}
                alt={t('about.vlog.title')}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/25 transition-colors duration-700 group-hover:bg-charcoal/10" />
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/90 text-forest-deep shadow-xl transition-transform duration-500 ease-organic group-hover:scale-110">
                <Play className="ml-1 h-7 w-7" fill="currentColor" strokeWidth={0} />
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 text-center">
            <h2 className="headline text-3xl text-charcoal md:text-4xl">
              {t('about.vlog.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty leading-cn text-charcoal-soft">
              {t('about.vlog.desc')}
            </p>
            <p className="mt-4 text-sm italic text-charcoal-soft/80">
              {t('about.vlog.date')} · {t('about.vlog.location')}
            </p>
          </Reveal>
        </section>

        {/* ===== 3 · JOURNEY UPDATES ===== */}
        <section className="border-y border-stone-light/50 bg-ivory-50 py-24 md:py-32">
          <div className="container-narrow">
            <Reveal className="max-w-2xl">
              <p className="eyebrow text-ochre">{t('about.updates.eyebrow')}</p>
              <h2 className="headline mt-3 text-3xl text-charcoal md:text-5xl">
                {t('about.updates.title')}
              </h2>
              <p className="mt-4 text-pretty leading-cn text-charcoal-soft">
                {t('about.updates.body')}
              </p>
            </Reveal>

            <div className="mt-14 space-y-8">
              {UPDATES.map((u, i) => {
                const inner = (
                  <>
                    <div className="overflow-hidden rounded-2xl md:w-[42%]">
                      <img
                        src={u.cover}
                        alt=""
                        className="aspect-[16/10] h-full w-full object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                      <p className="text-xs uppercase tracking-widest-2 text-forest-mist">
                        {u.date[lang]}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-charcoal md:text-3xl">
                        {u.title[lang]}
                      </h3>
                      <p className="mt-3 text-pretty leading-cn text-charcoal-soft">
                        {u.summary[lang]}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest">
                        {lang === 'zh' ? '阅读全文' : 'Read'}
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-organic group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </>
                )
                return (
                  <Reveal key={u.slug} delay={i * 0.05}>
                    {u.href ? (
                      <a
                        href={u.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col overflow-hidden rounded-2xl border border-stone-light/60 bg-ivory shadow-[0_18px_40px_-30px_rgba(38,36,31,0.35)] transition-all duration-500 ease-organic hover:shadow-[0_24px_50px_-30px_rgba(38,36,31,0.45)] md:flex-row"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="group flex flex-col overflow-hidden rounded-2xl border border-stone-light/60 bg-ivory shadow-[0_18px_40px_-30px_rgba(38,36,31,0.35)] md:flex-row">
                        {inner}
                      </div>
                    )}
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== 4 · ACKNOWLEDGEMENTS ===== */}
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
