import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useElementWidth } from './useChart'

export interface TreemapDatum {
  name: string
  value: number
  color?: string
  /** Optional deeper children for nesting. */
  children?: TreemapDatum[]
}

interface TreemapProps {
  data: TreemapDatum
  height?: number
  /** Called with the leaf name + value when a cell is hovered. */
  onHover?: (d: { name: string; value: number } | null) => void
}

/**
 * D3 treemap — encodes species diversity (or observation volume) as area.
 * Cells fade in with a staggered, organic delay and tint by group color.
 */
export function Treemap({ data, height = 380, onHover }: TreemapProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!width || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const root = d3
      .hierarchy<TreemapDatum>(data, (d) => d.children)
      .sum((d) => Math.max(0, d.value ?? 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    const treemap = d3
      .treemap<TreemapDatum>()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(0)
      .paddingInner(3)
      .round(true)

    treemap(root)

    // After layout, nodes carry x0/y0/x1/y1; cast to the rectangular type.
    const leaves = root.leaves() as d3.HierarchyRectangularNode<TreemapDatum>[]

    const cell = svg
      .selectAll('g')
      .data(leaves)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`)

    cell
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('rx', 5)
      .attr('fill', (d) => d.data.color || '#4E6B47')
      .attr('opacity', 0)
      .on('mouseenter', (_e, d) =>
        onHover?.({ name: d.data.name, value: d.value ?? 0 }),
      )
      .on('mouseleave', () => onHover?.(null))
      .transition()
      .duration(900)
      .delay((_, i) => Math.min(i * 25, 600))
      .ease(d3.easeCubicOut)
      .attr('opacity', 1)

    cell
      .append('text')
      .attr('x', 8)
      .attr('y', 18)
      .attr('font-size', 12)
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', '#F6F2E8')
      .attr('font-weight', 500)
      .attr('opacity', 0)
      .text((d) =>
        d.x1 - d.x0 > 70 && d.y1 - d.y0 > 34 ? truncate(d.data.name, 16) : '',
      )
      .transition()
      .duration(700)
      .delay((_, i) => 400 + Math.min(i * 25, 600))
      .attr('opacity', (d) =>
        d.x1 - d.x0 > 70 && d.y1 - d.y0 > 34 ? 0.95 : 0,
      )
  }, [data, width, height, onHover])

  return (
    <div ref={ref} className="w-full">
      <svg ref={svgRef} width={width} height={height} className="d3-chart" />
    </div>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
