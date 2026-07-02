import type { HeroSlide } from '@/components/shared/HeroSlideshow'

/**
 * The homepage hero slideshow is driven by our own expedition photographs
 * (see /public/hero), not live iNaturalist imagery. The 12 photos are listed
 * in a shuffled order so the opening sequence doesn't simply follow the
 * source folder's naming.
 */
const SHUFFLED = [6, 11, 2, 8, 1, 10, 4, 7, 12, 3, 5, 9]

export const HERO_SLIDES: HeroSlide[] = SHUFFLED.map((n) => ({
  url: `/hero/hero-${String(n).padStart(2, '0')}.jpg`,
}))
