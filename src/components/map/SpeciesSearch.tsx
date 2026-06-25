import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { searchTaxa } from '@/api/inaturalist'
import { photoUrl } from '@/lib/photos'
import { useT } from '@/i18n'
import type { Taxon } from '@/types'

interface SpeciesSearchProps {
  onSelect: (taxon: Taxon) => void
}

/**
 * Type-ahead taxon search. Debounced; results fade in with a gentle stagger.
 */
export function SpeciesSearch({ onSelect }: SpeciesSearchProps) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Taxon[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const id = setTimeout(async () => {
      const taxa = await searchTaxa(q, 8)
      setResults(taxa)
      setOpen(true)
      setLoading(false)
    }, 280)
    return () => clearTimeout(id)
  }, [query])

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function pick(taxon: Taxon) {
    onSelect(taxon)
    setQuery(taxon.preferred_common_name || taxon.name)
    setOpen(false)
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-stone-light bg-ivory-50 px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-charcoal-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={t('search.placeholder')}
          className="w-full bg-transparent text-sm text-charcoal placeholder:text-charcoal-soft/70 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            aria-label={t('search.clear')}
          >
            <X className="h-4 w-4 text-charcoal-soft" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-[1100] mt-2 w-full overflow-hidden rounded-2xl border border-stone-light bg-ivory-50 py-2 shadow-xl"
          >
            {loading ? (
              <li className="px-4 py-3 text-sm leading-cn text-charcoal-soft">
                {t('search.searching')}
              </li>
            ) : results.length ? (
              results.map((taxon, i) => (
                <motion.li
                  key={taxon.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <button
                    onClick={() => pick(taxon)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-ivory-200"
                  >
                    <img
                      src={photoUrl(taxon.default_photo?.url, 'square')}
                      alt=""
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-charcoal">
                        {taxon.preferred_common_name || taxon.name}
                      </span>
                      <span className="block truncate text-xs italic text-charcoal-soft">
                        {taxon.name} · {taxon.rank}
                      </span>
                    </span>
                  </button>
                </motion.li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm leading-cn text-charcoal-soft">
                {t('search.noResults')}
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
