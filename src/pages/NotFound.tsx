import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { useT } from '@/i18n'

export function NotFound() {
  const t = useT()
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center"
    >
      <Compass className="h-12 w-12 text-forest-mist" strokeWidth={1.2} />
      <p className="eyebrow mt-6">{t('404.eyebrow')}</p>
      <h1 className="headline mt-3 text-4xl md:text-6xl">{t('404.title')}</h1>
      <p className="mt-4 max-w-md leading-cn text-charcoal-soft">
        {t('404.body')}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-full bg-forest px-7 py-3 text-sm font-medium text-ivory-50 transition-colors duration-500 hover:bg-forest-light"
      >
        {t('404.cta')}
      </Link>
    </motion.section>
  )
}
