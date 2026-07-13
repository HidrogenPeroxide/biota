import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchSpeciesCounts } from '@/api/inaturalist'
import { useLang } from '@/i18n'

interface SpeciesName {
  id: number
  common: string
  sci: string
}

interface Slot {
  x: number
  y: number
  size: number
  vy: number // px per second upward
  driftPhase: number
  driftAmp: number
  driftFreq: number
  rot: number
  rotSpeed: number
  hovered: boolean
}

const N = 20 // visible bubbles (kept stable; recycled on exit)
const GROUPS = ['Aves', 'Mammalia', 'Plantae', 'Insecta', 'Reptilia', 'Amphibia']

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/**
 * Quiet, symbolic transition: the species observed during the expedition
 * slowly rise as softly glowing bubbles — memories gathering into a living
 * atlas. Names are pulled live from iNaturalist (localized), randomly sampled.
 *
 * A single requestAnimationFrame loop drives ~20 bubbles; transforms are
 * written straight to the DOM (no per-frame React re-render). Hovering a
 * bubble nearly stops it; bubbles leaving the top are recycled at the bottom.
 */
export function SpeciesBubbles({
  active,
  leaving,
}: {
  active: boolean
  leaving: boolean
}) {
  const lang = useLang()
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])
  const slotsRef = useRef<Slot[]>([])
  const poolRef = useRef<SpeciesName[]>([])
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const [labels, setLabels] = useState<SpeciesName[]>([])

  /* ---- load a localized species pool ---- */
  useEffect(() => {
    let cancelled = false
    Promise.all(GROUPS.map((g) => fetchSpeciesCounts({ iconic_taxa: g }, 40).catch(() => [])))
      .then((rows) => {
        if (cancelled) return
        const seen = new Set<number>()
        const pool: SpeciesName[] = []
        for (const r of rows.flat()) {
          const t = r.taxon
          if (!t || seen.has(t.id)) continue
          seen.add(t.id)
          pool.push({
            id: t.id,
            common: t.preferred_common_name || t.name,
            sci: t.name,
          })
        }
        // shuffle
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[pool[i], pool[j]] = [pool[j], pool[i]]
        }
        poolRef.current = pool
        if (pool.length) initSlots()
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  function pick(): SpeciesName {
    const p = poolRef.current
    return p.length ? p[Math.floor(Math.random() * p.length)] : { id: 0, common: '', sci: '' }
  }

  function makeSlot(h: number): Slot {
    return {
      x: rand(0, Math.max(1, containerRef.current?.clientWidth ?? 1)),
      y: rand(0, Math.max(1, h)),
      size: rand(86, 168),
      vy: rand(14, 34),
      driftPhase: rand(0, Math.PI * 2),
      driftAmp: rand(8, 26),
      driftFreq: rand(0.2, 0.6),
      rot: rand(-4, 4),
      rotSpeed: rand(-1.2, 1.2),
      hovered: false,
    }
  }

  function initSlots() {
    const h = containerRef.current?.clientHeight ?? 600
    const w = containerRef.current?.clientWidth ?? 800
    slotsRef.current = Array.from({ length: N }, () => {
      const s = makeSlot(h)
      s.x = rand(0, w)
      return s
    })
    setLabels(Array.from({ length: N }, () => pick()))
  }

  /* ---- animation loop ---- */
  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
      return
    }
    const w0 = containerRef.current?.clientWidth ?? 800
    const tick = (ts: number) => {
      const dt = lastTsRef.current ? Math.min(0.05, (ts - lastTsRef.current) / 1000) : 0
      lastTsRef.current = ts
      const w = containerRef.current?.clientWidth ?? w0
      const h = containerRef.current?.clientHeight ?? 600
      const slots = slotsRef.current
      let recycled = -1
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i]
        const speed = s.hovered ? 0.05 : 1
        s.y -= s.vy * dt * speed
        s.driftPhase += s.driftFreq * dt * speed
        s.rot += s.rotSpeed * dt * speed
        const x = s.x + Math.sin(s.driftPhase) * s.driftAmp
        const node = nodeRefs.current[i]
        if (node) {
          node.style.transform = `translate3d(${x.toFixed(1)}px, ${s.y.toFixed(
            1,
          )}px, 0) rotate(${s.rot.toFixed(2)}deg)`
        }
        if (s.y < -s.size) {
          // recycle at the bottom
          s.x = rand(0, w)
          s.y = h + s.size
          s.size = rand(86, 168)
          s.vy = rand(14, 34)
          s.driftAmp = rand(8, 26)
          s.driftFreq = rand(0.2, 0.6)
          recycled = i
        }
      }
      if (recycled >= 0) {
        const pickIdx = recycled
        setLabels((prev) => {
          const next = prev.slice()
          next[pickIdx] = pick()
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [active])

  // (Re)initialize once the container has a size, if not yet done.
  useEffect(() => {
    if (slotsRef.current.length === 0 && poolRef.current.length) initSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.8s ease' }}
    >
      {labels.map((sp, i) => (
        <div
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el
          }}
          onPointerEnter={() => {
            if (slotsRef.current[i]) slotsRef.current[i].hovered = true
          }}
          onPointerLeave={() => {
            if (slotsRef.current[i]) slotsRef.current[i].hovered = false
          }}
          className="group pointer-events-auto absolute left-0 top-0 will-change-transform"
          style={{ width: 0, height: 0 }}
        >
          <Link
            to={sp.id ? `/life-data/species/${sp.id}` : '/life-data'}
            className="species-orb absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full border border-ochre/30 bg-ochre/10 text-center backdrop-blur-md transition-all duration-500 ease-organic group-hover:scale-110 group-hover:border-ochre/60 group-hover:bg-ochre/20"
            style={{
              width: slotsRef.current[i]?.size ?? 120,
              height: slotsRef.current[i]?.size ?? 120,
            }}
          >
            <span className="px-3 font-display text-[13px] leading-tight text-bark/80 group-hover:text-bark">
              {sp.common}
            </span>
            <span className="mt-0.5 px-3 text-[9px] italic text-charcoal-soft/70">
              {sp.sci}
            </span>
          </Link>
        </div>
      ))}
    </div>
  )
}
