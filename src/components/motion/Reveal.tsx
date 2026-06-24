import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Delay before the reveal begins (seconds). */
  delay?: number
  /** Vertical offset to travel while fading in (px). */
  y?: number
  className?: string
  /** Render as a different element if needed. */
  as?: 'div' | 'section' | 'li' | 'span'
}

/**
 * Scroll-triggered fade-up wrapper. The motion is deliberately slow and
 * organic — a long duration with a soft cubic-bezier — to feel like a
 * documentary dissolve rather than a UI animation.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
}: RevealProps) {
  const MotionTag = motion[as]
  const variants: Variants = {
    hidden: { opacity: 0, y, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-12% 0px' }}
    >
      {children}
    </MotionTag>
  )
}
