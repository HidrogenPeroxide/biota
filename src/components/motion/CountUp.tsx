import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { formatCompact, formatNumber } from '@/lib/utils'

interface CountUpProps {
  value: number
  /** Duration of the count-up in milliseconds. */
  duration?: number
  /** Compact formatting (1.2k, 3.4M) instead of full separators. */
  compact?: boolean
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Smooth, organic count-up animation triggered when the number scrolls into
 * view. Uses an ease-out cubic curve so it decelerates naturally — never bouncy.
 */
export function CountUp({
  value,
  duration = 2000,
  compact = false,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // easeOutExpo — a slow, graceful settle.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(Math.round(eased * value))
      if (t < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {compact ? formatCompact(display) : formatNumber(display)}
      {suffix}
    </span>
  )
}
