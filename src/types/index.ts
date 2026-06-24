/**
 * Domain types for the biodiversity atlas.
 *
 * These are aligned with (a trimmed view of) the iNaturalist API v1 response
 * shapes. We intentionally only model the fields the UI uses, so the rest of
 * the payload is ignored. See src/api/inaturalist.ts for fetching.
 */

export type RankName =
  | 'kingdom'
  | 'phylum'
  | 'subphylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'subspecies'
  | string

/** A single photo attached to a taxon or observation. */
export interface iNatPhoto {
  id: number
  url: string
  square_url?: string
  thumb_url?: string
  small_url?: string
  medium_url?: string
  large_url?: string
  original_url?: string
  attribution?: string
  license_code?: string | null
}

export interface ConservationStatus {
  status: string
  status_name?: string
  authority?: string | null
  description?: string | null
  place?: { id: number; name?: string; display_name?: string } | null
}

/**
 * A taxon (a node in the tree of life). We model both the lightweight form
 * returned in lists and the richer form returned by the /taxa/{id} detail
 * endpoint in a single interface with optional fields.
 */
export interface Taxon {
  id: number
  name: string // scientific name, e.g. "Falco peregrinus"
  rank: RankName
  rank_level: number
  preferred_common_name?: string | null
  matched_term?: string | null
  iconic_taxon_name?: string | null // e.g. "Aves", "Mammalia"
  observations_count?: number
  species_count?: number
  default_photo?: {
    url: string
    square_url?: string
    medium_url?: string
    large_url?: string
  } | null
  taxon_photos?: { photo: iNatPhoto }[]
  ancestor_ids?: number[]
  ancestors?: Taxon[]
  children?: Taxon[]
  wikipedia_summary?: string | null
  wikipedia_url?: string | null
  conservation_status?: ConservationStatus | null
  conservation_statuses?: ConservationStatus[]
  taxon_changes_count?: number
  complete_species_count?: number | null
  active?: boolean
}

export interface ObservationPhoto {
  url: string
  square_url?: string
  medium_url?: string
  large_url?: string
  original_url?: string
}

export interface ObservationUser {
  id: number
  login: string
  name?: string | null
  icon_url?: string | null
}

/** An observation record — a single human + nature encounter. */
export interface Observation {
  id: number
  uuid: string
  taxon?: Taxon
  location?: string | null // "lat,lng"
  latitude?: number | null
  longitude?: number | null
  positional_accuracy?: number | null
  observed_on?: string | null
  time_observed_at?: string | null
  created_at?: string | null
  place_guess?: string | null
  photos?: ObservationPhoto[]
  user?: ObservationUser
  quality_grade?: string
  identifications_count?: number
  comments_count?: number
  faves_count?: number
  uri?: string
}

/** Result row from /observations/species_counts. */
export interface SpeciesCount {
  count: number
  taxon: Taxon
}

/** Result row from /observations/observers. */
export interface ObserverCount {
  observation_count: number
  species_count: number
  user: ObservationUser
}

/** A generic response envelope from iNaturalist. */
export interface iNatResponse<T> {
  total_results: number
  page: number
  per_page: number
  results: T[]
}

/** A pre-built node of the taxonomy tree shown on the Explore page. */
export interface TaxonomyNode {
  id: number
  name: string
  common?: string | null
  rank: RankName
  rank_level: number
  iconic?: string | null
  photo?: string
  count?: number
  species_count?: number
  children?: TaxonomyNode[]
  /** A canonical iNaturalist taxon id used when fetching descendants. */
  taxonId: number
}
