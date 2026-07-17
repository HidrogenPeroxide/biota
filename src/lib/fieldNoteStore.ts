/**
 * Hidden "Field Notes Archive" — a small collection of expedition records that
 * visitors gradually discover while exploring the site. Discovery is persisted
 * to localStorage so the archive fills in over time, across visits.
 *
 * The same store also drives the archive modal (open state + the logo's screen
 * position, used as the origin of the opening golden ripple).
 */

export type NoteId = '001' | '002' | '003' | '004'

export interface NoteDef {
  id: NoteId
  titleKey: string
  descKey: string
  /** which illustration to render */
  icon: 'compass' | 'feather' | 'leaf' | 'map'
}

export const NOTES: NoteDef[] = [
  { id: '001', titleKey: 'note.001.title', descKey: 'note.001.desc', icon: 'compass' },
  { id: '002', titleKey: 'note.002.title', descKey: 'note.002.desc', icon: 'feather' },
  { id: '003', titleKey: 'note.003.title', descKey: 'note.003.desc', icon: 'leaf' },
  { id: '004', titleKey: 'note.004.title', descKey: 'note.004.desc', icon: 'map' },
]

const STORAGE_KEY = 'biota-field-notes-v1'

interface Snapshot {
  open: boolean
  x: number
  y: number
  rev: number
}

// Discovered notes, in the order they were found (a personal record of the
// visitor's exploration history — never sorted by id).
let discovered: NoteId[] = loadDiscovered()
let open = false
let x = 0
let y = 0
let rev = 0
let snapshot: Snapshot = { open, x, y, rev }
const listeners = new Set<() => void>()

function loadDiscovered(): NoteId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as NoteId[]
    const valid = new Set(NOTES.map((n) => n.id))
    return arr.filter((n) => valid.has(n))
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(discovered))
  } catch {
    /* ignore */
  }
}

function emit() {
  snapshot = { open, x, y, rev }
  listeners.forEach((l) => l())
}

export const fieldNoteStore = {
  getSnapshot: (): Snapshot => snapshot,

  /** Open the archive (called by the logo double-click). Also marks #001. */
  open: (px: number, py: number) => {
    open = true
    x = px
    y = py
    fieldNoteStore.discover('001')
    emit()
  },
  close: () => {
    open = false
    emit()
  },

  /** Mark a note discovered, appended in discovery order. No-op if already. */
  discover: (id: NoteId): boolean => {
    if (discovered.includes(id)) return false
    discovered.push(id)
    persist()
    rev++
    emit()
    return true
  },
  /** Ordered list of discovered note ids (chronological discovery order). */
  discoveredList: (): NoteId[] => discovered,
  isDiscovered: (id: NoteId): boolean => discovered.includes(id),
  count: (): number => discovered.length,

  subscribe: (l: () => void): (() => void) => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

