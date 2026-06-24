import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Loader2 } from 'lucide-react'
import type { TaxonomyNode } from '@/types'
import { fetchTaxonChildren } from '@/api/inaturalist'
import { photoUrl } from '@/lib/photos'
import { cn } from '@/lib/utils'
import { TAXONOMY_ROOT } from '@/data/taxonomy'

interface TaxonomyTreeProps {
  selectedId: number | null
  onSelect: (node: {
    id: number
    name: string
    common?: string | null
    rank?: string
  }) => void
}

/**
 * An interactive tree of life. Top-level branches come from the curated root;
 * expanding a node lazily fetches its real descendant taxa from iNaturalist,
 * so the tree literally grows as the user explores. Branches animate open
 * with a smooth, organic expand.
 */
export function TaxonomyTree({ selectedId, onSelect }: TaxonomyTreeProps) {
  return (
    <nav className="flex flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="eyebrow">Tree of life</span>
        <span className="h-px flex-1 bg-stone-light/70" />
      </div>
      <ul className="flex flex-col gap-1">
        {TAXONOMY_ROOT.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  )
}

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TaxonomyNode
  depth: number
  selectedId: number | null
  onSelect: TaxonomyTreeProps['onSelect']
}) {
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState<TaxonomyNode[] | null>(null)
  const [loading, setLoading] = useState(false)

  const isSelected = selectedId === node.id

  async function handleExpand() {
    const next = !open
    setOpen(next)
    if (next && children === null) {
      setLoading(true)
      try {
        const taxa = await fetchTaxonChildren(node.taxonId, 40)
        const mapped: TaxonomyNode[] = taxa
          .filter((t) => t.id !== node.id)
          .map((t) => ({
            id: t.id,
            taxonId: t.id,
            name: t.name,
            common: t.preferred_common_name ?? null,
            rank: t.rank,
            rank_level: t.rank_level,
            iconic: t.iconic_taxon_name ?? node.iconic,
            photo: photoUrl(t.default_photo?.url, 'square'),
            count: t.observations_count,
            children: [],
          }))
        setChildren(mapped)
      } catch {
        setChildren([])
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <li>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-xl py-2 pr-3 transition-colors duration-300',
          isSelected ? 'bg-forest/8' : 'hover:bg-ivory-200/70',
        )}
        style={{ paddingLeft: depth * 14 }}
      >
        <button
          onClick={handleExpand}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-charcoal-soft transition-transform duration-500 ease-organic',
            open && 'rotate-90',
          )}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          onClick={() =>
            onSelect({
              id: node.id,
              name: node.name,
              common: node.common,
              rank: node.rank,
            })
          }
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {node.photo ? (
            <img
              src={node.photo}
              alt=""
              loading="lazy"
              className="h-7 w-7 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span
              className="h-7 w-7 shrink-0 rounded-md"
              style={{
                background:
                  'linear-gradient(135deg, var(--tw-gradient-from, #A8B59B), #C8BDA7)',
              }}
            />
          )}
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                'block truncate text-sm font-medium',
                isSelected ? 'text-forest' : 'text-charcoal',
              )}
            >
              {node.common || node.name}
            </span>
            <span className="block truncate text-xs italic text-charcoal-soft">
              {node.name}
            </span>
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && children && children.length > 0 && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children.slice(0, 30).map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
