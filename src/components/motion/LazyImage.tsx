import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src?: string
  alt: string
  className?: string
  /** Aspect ratio wrapper class, e.g. 'aspect-[4/3]'. */
  ratioClassName?: string
  /** Optional hover zoom on the image. */
  zoom?: boolean
}

/**
 * Image with a soft fade-in and a warm-toned skeleton placeholder. Handles
 * missing/broken src gracefully by falling back to an earth-tone gradient.
 */
export function LazyImage({
  src,
  alt,
  className,
  ratioClassName,
  zoom = false,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // If the browser already has the image cached, onload may not fire.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [src])

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-ivory-200',
        ratioClassName,
        className,
      )}
    >
      {!loaded && !errored && (
        <div className="shimmer absolute inset-0 bg-gradient-to-br from-ivory-200 via-cream to-sand" />
      )}
      {errored ? (
        <div className="absolute inset-0 bg-gradient-to-br from-sage/40 via-stone/30 to-bark/30" />
      ) : (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            'h-full w-full object-cover transition-all duration-1000 ease-organic',
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            zoom && 'group-hover:scale-[1.06]',
          )}
        />
      )}
    </div>
  )
}
