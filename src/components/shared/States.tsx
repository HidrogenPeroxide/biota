import { motion } from 'framer-motion'
import { Sprout } from 'lucide-react'
import { useT } from '@/i18n'

/** Elegant empty/error state for when live data can't be loaded. */
export function EmptyState({ onRetry }: { onRetry?: () => void }) {
  const t = useT()
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone/60 bg-ivory-50/60 px-8 py-16 text-center"
    >
      <Sprout className="h-8 w-8 text-forest-mist" strokeWidth={1.3} />
      <h3 className="mt-4 font-display text-2xl text-charcoal">
        {t('states.empty.title')}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-cn text-charcoal-soft">
        {t('states.empty.message')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-full border border-forest/30 px-5 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest hover:text-ivory-50"
        >
          {t('states.retry')}
        </button>
      )}
    </motion.div>
  )
}
