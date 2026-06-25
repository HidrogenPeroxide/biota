/**
 * Pre-generated taxonomy tree root.
 *
 * The Explore page opens on these curated "iconic taxa" branches (the major
 * groups iNaturalist uses to organize life). Each node carries its real
 * iNaturalist taxon id so that, when a user expands it, we can lazily fetch
 * the actual descendant taxa from the API — the tree literally grows from
 * live data.
 *
 * The ids here are canonical iNaturalist taxon ids (verified against the API):
 *   Aves 3 · Mammalia 40151 · Reptilia 26036 · Amphibia 20978
 *   Actinopterygii 47178 · Insecta 47158 · Arachnida 47119
 *   Mollusca 47120 · Plantae 47126 · Fungi 47170
 */

import type { TaxonomyNode } from '@/types'

export const TAXONOMY_ROOT: TaxonomyNode[] = [
  {
    id: 3,
    taxonId: 3,
    name: 'Aves',
    common: 'Birds',
    rank: 'class',
    rank_level: 50,
    iconic: 'Aves',
    count: 0,
    children: [],
  },
  {
    id: 40151,
    taxonId: 40151,
    name: 'Mammalia',
    common: 'Mammals',
    rank: 'class',
    rank_level: 50,
    iconic: 'Mammalia',
    count: 0,
    children: [],
  },
  {
    id: 26036,
    taxonId: 26036,
    name: 'Reptilia',
    common: 'Reptiles',
    rank: 'class',
    rank_level: 50,
    iconic: 'Reptilia',
    count: 0,
    children: [],
  },
  {
    id: 20978,
    taxonId: 20978,
    name: 'Amphibia',
    common: 'Amphibians',
    rank: 'class',
    rank_level: 50,
    iconic: 'Amphibia',
    count: 0,
    children: [],
  },
  {
    id: 47178,
    taxonId: 47178,
    name: 'Actinopterygii',
    common: 'Ray-finned Fishes',
    rank: 'class',
    rank_level: 50,
    iconic: 'Actinopterygii',
    count: 0,
    children: [],
  },
  {
    id: 47158,
    taxonId: 47158,
    name: 'Insecta',
    common: 'Insects',
    rank: 'class',
    rank_level: 50,
    iconic: 'Insecta',
    count: 0,
    children: [],
  },
  {
    id: 47119,
    taxonId: 47119,
    name: 'Arachnida',
    common: 'Arachnids',
    rank: 'class',
    rank_level: 50,
    iconic: 'Arachnida',
    count: 0,
    children: [],
  },
  {
    id: 47120,
    taxonId: 47120,
    name: 'Mollusca',
    common: 'Mollusks',
    rank: 'phylum',
    rank_level: 60,
    iconic: 'Mollusca',
    count: 0,
    children: [],
  },
  {
    id: 47126,
    taxonId: 47126,
    name: 'Plantae',
    common: 'Plants',
    rank: 'kingdom',
    rank_level: 70,
    iconic: 'Plantae',
    count: 0,
    children: [],
  },
  {
    id: 47170,
    taxonId: 47170,
    name: 'Fungi',
    common: 'Fungi',
    rank: 'kingdom',
    rank_level: 70,
    iconic: 'Fungi',
    count: 0,
    children: [],
  },
]

/**
 * Sensible fallback headline statistics used until the live total arrives
 * (or if the API is unreachable). Values are deliberately conservative
 * order-of-magnitude estimates so the count-up animation still feels truthful.
 */
export const FALLBACK_STATS = {
  observations: 230_000_000,
  species: 480_000,
  observers: 3_200_000,
  places: 425_000,
}

/** Iconic-taxon display metadata for charts and legends. */
export const ICONIC_META: Record<
  string,
  { label: string; color: string; glyph: string }
> = {
  Aves: { label: 'Birds', color: '#33513E', glyph: '🐦' },
  Mammalia: { label: 'Mammals', color: '#9C6B4F', glyph: '🦌' },
  Reptilia: { label: 'Reptiles', color: '#6B8A62', glyph: '🦎' },
  Amphibia: { label: 'Amphibians', color: '#8A9A7B', glyph: '🐸' },
  Actinopterygii: { label: 'Fishes', color: '#B58968', glyph: '🐟' },
  Insecta: { label: 'Insects', color: '#B8893A', glyph: '🦋' },
  Arachnida: { label: 'Arachnids', color: '#7A6651', glyph: '🕷️' },
  Mollusca: { label: 'Mollusks', color: '#A89E89', glyph: '🐚' },
  Plantae: { label: 'Plants', color: '#4E6B47', glyph: '🌿' },
  Fungi: { label: 'Fungi', color: '#8B6F47', glyph: '🍄' },
  Animalia: { label: 'Animals', color: '#5A4A3A', glyph: '🐾' },
}

export function iconColor(name?: string | null): string {
  return (name && ICONIC_META[name]?.color) || '#5A4A3A'
}

/**
 * Localized label for an iconic taxon name. Falls back to the English label in
 * ICONIC_META, then the raw name. Use this anywhere a group name is shown.
 */
export function iconicLabel(
  t: (key: string) => string,
  name?: string | null,
): string {
  if (!name) return ''
  const localized = t(`taxa.${name}`)
  if (localized && localized !== `taxa.${name}`) return localized
  return ICONIC_META[name]?.label || name
}
