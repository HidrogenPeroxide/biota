import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map as MapIcon, ListTree, SlidersHorizontal } from 'lucide-react'
import { TaxonomyTree } from '@/components/explore/TaxonomyTree'
import { SpeciesPanel } from '@/components/explore/SpeciesPanel'
import { ObservationMap } from '@/components/map/ObservationMap'
import { PageTransition } from '@/components/motion/PageTransition'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsync } from '@/hooks/useAsync'
import {
  fetchObservations,
  fetchSpeciesCounts,
  fetchTaxon,
} from '@/api/inaturalist'
import { TAXONOMY_ROOT, iconColor } from '@/data/taxonomy'
import type { Observation, SpeciesCount, Taxon } from '@/types'
import { useT } from '@/i18n'

interface Selection {
  id: number
  name: string
  common?: string | null
  rank?: string
}

const ease = [0.22, 1, 0.36, 1] as const

export function Explore() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const initialTaxon = params.get('taxon')
  const initialNode =
    TAXONOMY_ROOT.find((n) => String(n.taxonId) === initialTaxon) ?? null

  const [selection, setSelection] = useState<Selection | null>(
    initialNode
      ? {
          id: initialNode.taxonId,
          name: initialNode.name,
          common: initialNode.common,
          rank: initialNode.rank,
        }
      : null,
  )
  // The species panel is a floating drawer over the map. `collapsed` toggles
  // between the full list and a slim vertical tab; it never occupies layout.
  const [panelCollapsed, setPanelCollapsed] = useState(false)

  // Resolve the taxon detail (for a nice title/subtitle) when selected.
  const { data: taxon } = useAsync<Taxon | null>(
    () => (selection ? fetchTaxon(selection.id) : Promise.resolve(null)),
    [selection?.id],
  )

  // Most-observed species within the selection (for the panel).
  const { data: species, loading: speciesLoading } = useAsync<SpeciesCount[]>(
    () =>
      selection
        ? fetchSpeciesCounts({ taxon_id: selection.id }, 40)
        : Promise.resolve([]),
    [selection?.id],
  )

  // Map observations within the selection.
  const { data: observations, loading: obsLoading } = useAsync<Observation[]>(
    () =>
      selection
        ? fetchObservations({
            taxon_id: selection.id,
            order_by: 'observed_on',
            order: 'desc',
            per_page: 120,
          })
        : Promise.resolve([]),
    [selection?.id],
  )

  const totalSpecies = useMemo(
    () => species?.reduce((sum, s) => sum + s.count, 0),
    [species],
  )

  const flyTarget = useMemo(() => {
    if (!observations || observations.length === 0) return undefined
    const withLoc = observations.filter((o) => {
      const lat = o.latitude ?? Number(o.location?.split(',')[0])
      const lng = o.longitude ?? Number(o.location?.split(',')[1])
      return Number.isFinite(lat) && Number.isFinite(lng)
    })
    if (!withLoc.length) return undefined
    const lat =
      withLoc.reduce((s, o) => s + (o.latitude ?? 0), 0) / withLoc.length
    const lng =
      withLoc.reduce((s, o) => s + (o.longitude ?? 0), 0) / withLoc.length
    return { center: [lat, lng] as [number, number], zoom: 3, key: selection?.id ?? 0 }
  }, [observations, selection?.id])

  function handleSelect(node: Selection) {
    setSelection(node)
    // Expand the drawer whenever a fresh group is chosen.
    setPanelCollapsed(false)
    setParams(node ? { taxon: String(node.id) } : {}, { replace: true })
  }

  // Sync if the URL taxon changes externally (e.g. landing links).
  useEffect(() => {
    if (!initialNode) return
    setSelection({
      id: initialNode.taxonId,
      name: initialNode.name,
      common: initialNode.common,
      rank: initialNode.rank,
    })
    setPanelCollapsed(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('taxon')])

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col pt-[72px]">
        {/* Header */}
        <div className="border-b border-stone-light/60 bg-ivory-50">
          <div className="container-wide flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{t('explore.eyebrow')}</p>
              <h1 className="headline mt-2 text-4xl md:text-5xl">
                {t('explore.title')}
              </h1>
              <p className="mt-3 max-w-xl leading-cn text-charcoal-soft">
                {t('explore.body')}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-charcoal-soft">
              <span className="inline-flex items-center gap-2">
                <ListTree className="h-4 w-4 text-forest" /> {t('explore.tagTaxonomy')}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-forest" /> {t('explore.tagMap')}
              </span>
              <span className="hidden items-center gap-2 sm:inline-flex">
                <SlidersHorizontal className="h-4 w-4 text-forest" /> {t('explore.tagDetails')}
              </span>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row md:p-8">
          {/* Taxonomy tree */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease }}
            className="w-full shrink-0 overflow-y-auto rounded-2xl border border-stone-light/70 bg-ivory-50 p-5 md:max-h-[calc(100vh-220px)] md:w-80 lg:w-96"
          >
            <TaxonomyTree
              selectedId={selection?.id ?? null}
              onSelect={handleSelect}
            />
          </motion.aside>

          {/* Map + floating species drawer share a positioning wrapper so the
              drawer aligns to the map's edges without being clipped by the
              map's rounded overflow-hidden container. */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="relative min-h-[460px] flex-1"
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-stone-light/70">
              {obsLoading ? (
                <Skeleton className="absolute inset-0 rounded-2xl" />
              ) : (
                <ObservationMap
                  observations={observations ?? []}
                  mode="markers"
                  flyTo={flyTarget}
                  className="absolute inset-0 h-full w-full"
                />
              )}

              {/* Floating selection chip */}
              {selection && (
                <motion.button
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease }}
                  onClick={() => setPanelCollapsed(false)}
                  className="absolute left-4 top-4 flex items-center gap-3 rounded-full border border-stone-light/80 bg-ivory-50/90 px-4 py-2 text-left shadow-lg backdrop-blur-md transition-transform hover:scale-[1.02]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: iconColor(
                        TAXONOMY_ROOT.find((n) => n.id === selection.id)?.iconic,
                      ),
                    }}
                  />
                  <span>
                    <span className="block text-xs text-charcoal-soft">
                      {t('explore.viewing')}
                    </span>
                    <span className="block text-sm font-medium text-charcoal">
                      {selection.common || selection.name}
                    </span>
                  </span>
                </motion.button>
              )}

              {!selection && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                  <div className="max-w-sm rounded-2xl bg-ivory-50/85 p-6 text-center backdrop-blur-md">
                    <p className="font-display text-xl text-charcoal">
                      {t('explore.mapHintTitle')}
                    </p>
                    <p className="mt-2 text-sm leading-cn text-charcoal-soft">
                      {t('explore.mapHintBody')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating species drawer — aligned to the map's right & bottom
                edges; the circular toggle sits on its left edge. */}
            <SpeciesPanel
              open={!!selection}
              collapsed={panelCollapsed}
              onToggleCollapsed={() => setPanelCollapsed((v) => !v)}
              title={
                selection?.common ||
                taxon?.preferred_common_name ||
                selection?.name ||
                ''
              }
              subtitle={selection ? selection.name : undefined}
              species={species ?? null}
              loading={speciesLoading}
              count={totalSpecies}
              accentColor={iconColor(
                TAXONOMY_ROOT.find((n) => n.id === selection?.id)?.iconic,
              )}
            />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
