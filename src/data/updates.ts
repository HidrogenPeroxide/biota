export interface Bilingual {
  zh: string
  en: string
}

export interface UpdateEntry {
  slug: string
  cover: string
  title: Bilingual
  date: Bilingual
  summary: Bilingual
  /** External article/post URL. Leave empty until real links exist. */
  href: string
}

/** Set this to the published vlog URL when ready (e.g. a Bilibili/YouTube link). */
export const VLOG = {
  cover: '/hero/hero-05.jpg',
  href: '',
}

/** A large group photograph for the acknowledgements section. */
export const GROUP_PHOTO = '/hero/hero-11.jpg'

/**
 * Journey update cards — placeholder entries (cover images reused from the
 * hero set). Replace titles/dates/summaries/links with real field posts.
 */
export const UPDATES: UpdateEntry[] = [
  {
    slug: 'preparation',
    cover: '/hero/hero-02.jpg',
    title: { zh: '整理行装', en: 'Packing the kit' },
    date: { zh: '2025 · 07 · 09', en: 'Jul 9, 2025' },
    summary: {
      zh: '出发前夜，把图鉴、相机与备用电池摊在地板上，反复确认。',
      en: 'The night before — guides, cameras and spare batteries spread across the floor, checked twice.',
    },
    href: '',
  },
  {
    slug: 'plateau',
    cover: '/hero/hero-10.jpg',
    title: { zh: '抵达高原', en: 'Reaching the plateau' },
    date: { zh: '2025 · 07 · 13', en: 'Jul 13, 2025' },
    summary: {
      zh: '翻过第一个垭口，辽阔让人失语。空气稀薄，每一次呼吸都清晰可辨。',
      en: 'Crossing the first pass, the vastness took our words away. The air thins; every breath becomes something you can hear.',
    },
    href: '',
  },
  {
    slug: 'source',
    cover: '/hero/hero-12.jpg',
    title: { zh: '在源头', en: 'At the source' },
    date: { zh: '2025 · 07 · 14', en: 'Jul 14, 2025' },
    summary: {
      zh: '三条大江的源头比想象中安静。我们蹲下身，喝了第一口水。',
      en: 'The headwaters of three great rivers were quieter than we imagined. We crouched down and drank.',
    },
    href: '',
  },
  {
    slug: 'return',
    cover: '/hero/hero-07.jpg',
    title: { zh: '返程', en: 'The way home' },
    date: { zh: '2025 · 07 · 17', en: 'Jul 17, 2025' },
    summary: {
      zh: '飞机降落时，手机里多了几百条观察——它们安静地排在地图上。',
      en: 'When the plane touched down, the phone held hundreds of new observations — lying quietly across the map.',
    },
    href: '',
  },
]
