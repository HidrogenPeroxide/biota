import { motion } from 'framer-motion'
import { Compass, Users, Database, Cpu, Heart } from 'lucide-react'
import { PageTransition } from '@/components/motion/PageTransition'
import { Reveal } from '@/components/motion/Reveal'
import { useT } from '@/i18n'

const ease = [0.22, 1, 0.36, 1] as const

export function About() {
  const t = useT()

  return (
    <PageTransition>
      <div className="pt-[72px]">
        {/* Header */}
        <header className="relative overflow-hidden border-b border-stone-light/60 bg-forest-deep text-ivory-50">
          <div className="absolute inset-0 bg-gradient-to-br from-bark-dark/60 via-forest-deep to-forest" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="container-wide relative z-10 py-24 md:py-32"
          >
            <Compass className="h-9 w-9 text-ochre" strokeWidth={1.2} />
            <p className="eyebrow mt-6 text-sage">{t('about.eyebrow')}</p>
            <h1 className="headline mt-3 max-w-3xl text-4xl text-ivory-50 md:text-6xl">
              {t('about.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty leading-cn text-lg text-ivory-50/80">
              {t('about.intro')}
            </p>
          </motion.div>
        </header>

        {/* Sections */}
        <div className="container-narrow space-y-20 py-20 md:space-y-28 md:py-28">
          <AboutRow
            icon={<Compass className="h-5 w-5" />}
            title={t('about.motivationTitle')}
            body={t('about.motivationBody')}
          />
          <AboutRow
            icon={<Users className="h-5 w-5" />}
            title={t('about.teamTitle')}
            body={t('about.teamBody')}
          />
          <AboutRow
            icon={<Database className="h-5 w-5" />}
            title={t('about.dataTitle')}
            body={t('about.dataBody', { inat: t('footer.inat') })}
          />
          <AboutRow
            icon={<Cpu className="h-5 w-5" />}
            title={t('about.techTitle')}
            body={t('about.techBody')}
          />
          <AboutRow
            icon={<Heart className="h-5 w-5" />}
            title={t('about.thanksTitle')}
            body={t('about.thanksBody')}
          />
        </div>
      </div>
    </PageTransition>
  )
}

function AboutRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <Reveal>
      <div className="grid gap-6 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/8 text-forest">
              {icon}
            </span>
            <h2 className="font-display text-2xl text-charcoal md:text-3xl">
              {title}
            </h2>
          </div>
        </div>
        <p className="text-pretty leading-cn text-lg text-charcoal-soft md:col-span-8">
          {body}
        </p>
      </div>
    </Reveal>
  )
}
