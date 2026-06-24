/**
 * iNaturalist photo URL helpers.
 *
 * iNaturalist stores each photo at a stable path and serves sized variants by
 * swapping the final path segment, e.g.
 *   .../photos/2967053/square.jpg   (default_photo.url from list endpoints)
 *   .../photos/2967053/medium.jpg
 *   .../photos/2967053/large.jpg
 *   .../photos/2967053/original.jpg
 *
 * List/autocomplete endpoints return only the square variant, so we derive
 * larger variants here when needed.
 */

export type PhotoSize =
  | 'square'
  | 'small'
  | 'medium'
  | 'large'
  | 'original'

const SIZE_RE = /^(.*\/photos\/\d+\/)(square|small|medium|large|original)(\.(?:jpe?g|png|gif|webp))$/i

/** Upgrade (or downgrade) an iNaturalist photo URL to the requested size. */
export function photoUrl(
  url: string | undefined | null,
  size: PhotoSize = 'large',
): string | undefined {
  if (!url) return undefined
  const matched = url.match(SIZE_RE)
  if (matched) return `${matched[1]}${size}${matched[3]}`
  return url
}

/**
 * Pick the best available photo URL from an object that may expose several
 * sized fields (observations / taxon_photos), falling back to deriving from a
 * single `url`.
 */
export function pickPhoto(
  photo:
    | {
        url?: string
        square_url?: string
        small_url?: string
        medium_url?: string
        large_url?: string
        original_url?: string
      }
    | undefined
    | null,
  preferred: PhotoSize = 'large',
): string | undefined {
  if (!photo) return undefined
  const keys = [
    `${preferred}_url`,
    'large_url',
    'medium_url',
    'original_url',
    'small_url',
    'square_url',
    'url',
  ] as const
  for (const key of keys) {
    const val = photo[key]
    if (typeof val === 'string' && val) {
      // If the chosen field is just the generic `url` (square-only), try to
      // upgrade it to the preferred size for crisper display.
      if (key === 'url') return photoUrl(val, preferred)
      return val
    }
  }
  return undefined
}
