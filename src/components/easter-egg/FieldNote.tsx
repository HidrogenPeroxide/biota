import { useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fieldNoteStore, NOTES, type NoteId } from '@/lib/fieldNoteStore'
import { useT } from '@/i18n'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Hidden "Field Notes Archive" — a notebook of expedition records discovered
 * while exploring the site. Calm, museum-archive in tone; never game-like.
 * Revealed by double-clicking the Biota logo.
 *
 * - Discovered cards show their icon + title; clicking opens the full note in
 *   a floating detail card.
 * - Undiscovered cards reveal only their number — a quiet, mysterious page.
 */
export function FieldNote() {
  const t = useT()
  const snap = useSyncExternalStore(fieldNoteStore.subscribe, fieldNoteStore.getSnapshot)
  const [detail, setDetail] = useState<NoteId | null>(null)

  useEffect(() => {
    if (!snap.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detail) setDetail(null)
        else fieldNoteStore.close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [snap.open, detail])

  // Reset the detail popup whenever the archive closes.
  useEffect(() => {
    if (!snap.open) setDetail(null)
  }, [snap.open])

  const discovered = fieldNoteStore.count()
  const total = fieldNoteStore.total
  const detailNote = detail ? NOTES.find((n) => n.id === detail) : null

  return (
    <AnimatePresence>
      {snap.open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease }}
          onClick={fieldNoteStore.close}
        >
          {/* dimmed, blurred backdrop */}
          <div className="absolute inset-0 bg-charcoal/55 backdrop-blur-md" />

          {/* golden ripple from the logo */}
          {[0, 0.15].map((delay, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute rounded-full border border-ochre/55"
              style={{ left: snap.x, top: snap.y, translateX: '-50%', translateY: '-50%' }}
              initial={{ width: 28, height: 28, opacity: 0.7 - i * 0.2 }}
              animate={{ width: i ? 820 : 560, height: i ? 820 : 560, opacity: 0 }}
              transition={{ duration: i ? 1.4 : 1.1, ease, delay }}
            />
          ))}

          {/* archive notebook */}
          <motion.div
            initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            transition={{ duration: 0.65, ease, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
            className="field-note-paper relative w-full max-w-2xl overflow-hidden rounded-[18px] border border-stone-light/70 bg-ivory-50 px-6 py-9 shadow-[0_40px_90px_-30px_rgba(38,36,31,0.6)] md:px-10 md:py-11"
          >
            {/* header */}
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest-2 text-ochre">
                {t('archive.subtitle')}
              </p>
              <h2 className="headline mt-2 text-3xl text-charcoal md:text-4xl">
                {t('archive.title')}
              </h2>
              <div className="mx-auto mt-4 h-px w-12 bg-ochre/50" />
            </div>

            {/* 2×2 grid of archive cards */}
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {NOTES.map((note, i) => (
                <ArchiveCard
                  key={note.id}
                  index={i + 1}
                  icon={note.icon}
                  title={t(note.titleKey)}
                  revealed={fieldNoteStore.isDiscovered(note.id)}
                  onOpen={() => setDetail(note.id)}
                />
              ))}
            </div>

            {/* progress */}
            <div className="mt-8 border-t border-stone-light/60 pt-5 text-center">
              <p className="font-display text-lg text-charcoal">
                {t('archive.progressLabel')}{' '}
                <span className="text-ochre">
                  {discovered} / {total}
                </span>
              </p>
              {discovered < total && (
                <p className="mt-1 text-xs italic leading-cn text-charcoal-soft/70">
                  {t('archive.remaining')}
                </p>
              )}
            </div>
          </motion.div>

          {/* floating detail card for a discovered note */}
          <AnimatePresence>
            {detailNote && (
              <motion.div
                className="fixed inset-0 z-[2050] flex items-center justify-center p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                onClick={() => setDetail(null)}
              >
                <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" />
                <motion.div
                  initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                  transition={{ duration: 0.5, ease }}
                  onClick={(e) => e.stopPropagation()}
                  className="field-note-paper relative w-full max-w-sm overflow-hidden rounded-[16px] border border-stone-light/70 bg-ivory-50 px-7 py-8 text-center shadow-[0_40px_90px_-30px_rgba(38,36,31,0.6)]"
                >
                  <div className="flex justify-center">
                    <NoteIcon kind={detailNote.icon} />
                  </div>
                  <p className="mt-4 text-[10px] font-medium uppercase tracking-widest-2 text-forest-mist">
                    {t('archive.noteLabel', { n: Number(detailNote.id) })}
                  </p>
                  <h3 className="headline mt-2 text-2xl text-charcoal">
                    {t(detailNote.titleKey)}
                  </h3>
                  <div className="mx-auto mt-4 h-px w-10 bg-ochre/50" />
                  <p className="mt-4 text-pretty leading-cn text-[15px] text-charcoal-soft">
                    {t(detailNote.descKey)}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ArchiveCard({
  index,
  icon,
  title,
  revealed,
  onOpen,
}: {
  index: number
  icon: 'compass' | 'feather' | 'leaf' | 'map'
  title: string
  revealed: boolean
  onOpen: () => void
}) {
  const t = useT()
  if (!revealed) {
    // Undiscovered — only the number; quiet and mysterious.
    return (
      <div className="relative rounded-2xl border border-stone-light/50 bg-ivory/60 px-5 py-6">
        <p className="text-[10px] font-medium uppercase tracking-widest-2 text-charcoal-soft/40">
          {t('archive.noteLabel', { n: index })}
        </p>
      </div>
    )
  }
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4, ease }}
      className="group relative flex w-full items-start gap-4 rounded-2xl border border-stone-light/70 bg-ivory px-5 py-5 text-left shadow-[0_10px_24px_-18px_rgba(38,36,31,0.4)] transition-shadow duration-500 hover:shadow-[0_18px_36px_-20px_rgba(38,36,31,0.5)]"
    >
      <NoteIcon kind={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-widest-2 text-forest-mist">
          {t('archive.noteLabel', { n: index })}
        </p>
        <h3 className="mt-1 font-display text-lg leading-tight text-charcoal">
          {title}
        </h3>
      </div>
    </motion.button>
  )
}

/** Hand-drawn, scientific-notebook line illustrations (charcoal + muted gold). */
function NoteIcon({ kind }: { kind: 'compass' | 'feather' | 'leaf' | 'map' }) {
  const stroke = '#26241f'
  const gold = '#b8893a'
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0" aria-hidden="true">
      {kind === 'compass' && (
        <g {...common}>
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="24" r="1.6" fill={gold} stroke="none" />
          <path d="M24 10v4M24 34v4M10 24h4M34 24h4" />
          <path d="M24 15 L21 24 L27 24 Z" stroke={gold} />
          <path d="M24 33 L21 24 L27 24 Z" />
        </g>
      )}
      {kind === 'feather' && (
        <g {...common}>
          <path d="M14 34c0-10 8-20 20-22-1 9-7 17-16 19" />
          <path d="M16 32c4-1 8-4 11-8" />
          <path d="M14 34l8-2" stroke={gold} />
          <path d="M14 34c2 2 5 2 7 0" />
        </g>
      )}
      {kind === 'leaf' && (
        <g {...common}>
          <path d="M12 36c0-14 12-24 24-24 0 14-10 24-24 24z" />
          <path d="M12 36c6-8 12-13 20-18" stroke={gold} />
          <path d="M18 30l4-3M22 33l5-4M26 30l4-3" />
        </g>
      )}
      {kind === 'map' && (
        <g {...common}>
          <path d="M8 14l10-3 12 3 10-3v24l-10 3-12-3-10 3z" />
          <path d="M18 11v24M30 14v24" />
          <path d="M12 32c4-6 8-4 12-8s8 0 12-6" stroke={gold} />
        </g>
      )}
    </svg>
  )
}
