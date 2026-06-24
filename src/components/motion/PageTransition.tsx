import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Slow, elegant fade for top-level route changes. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}
