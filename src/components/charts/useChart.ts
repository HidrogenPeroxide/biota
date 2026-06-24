import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

/** Observe an element's width so SVG charts can render responsively. */
export function useElementWidth<T extends HTMLElement>(): [
  MutableRefObject<T | null>,
  number,
] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

/** Shared earth-tone chart palette. */
export const CHART_COLORS = [
  '#243B2C',
  '#33513E',
  '#4E6B47',
  '#6B8A62',
  '#8A9A7B',
  '#9C6B4F',
  '#B58968',
  '#B8893A',
  '#7A6651',
  '#A89E89',
]
