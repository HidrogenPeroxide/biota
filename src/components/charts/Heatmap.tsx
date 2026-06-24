import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useElementWidth } from './useChart'

export interface HeatmapCell {
  row: string
  col: string
  value: number
}

interface HeatmapProps {
  cells: HeatmapCell[]
  rows: string[]
  cols?: string[]
  height?: number
  /** Color scale domain anchors (earth tones). */
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Calendar-style heatmap: rows = taxonomic groups, columns = months. Cell
 * color intensity encodes seasonal observation activity. Cells fade in by
 * column so the seasons "arrive" left to right.
 */
export function Heatmap({
  cells,
  rows,
  cols = MONTHS,
  height,
}: HeatmapProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)
  const h = height ?? rows.length * 44 + 40

  useEffect(() => {
    if (!width || !svgRef.current || !cells.length) return
    const margin = { top: 16, right: 12, bottom: 12, left: 110 }
    const w = width - margin.left - margin.right
    const innerH = rows.length * 36

    const svg = d3.select(svgRef.current)
    svg.attr('height', innerH + margin.top + margin.bottom)
    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand().domain(cols).range([0, w]).padding(0.12)
    const y = d3.scaleBand().domain(rows).range([0, innerH]).padding(0.12)

    const max = d3.max(cells, (d) => d.value) ?? 1
    const color = d3
      .scaleSequential<string>(
        (t) => d3.interpolateRgbBasis(['#EFE9DA', '#A8B59B', '#6B8A62', '#33513E', '#243B2C'])(t),
      )
      .domain([0, max])

    // Column headers
    g.append('g')
      .selectAll('text')
      .data(cols)
      .enter()
      .append('text')
      .attr('x', (d) => x(d)! + x.bandwidth() / 2)
      .attr('y', -6)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#54514A')
      .text((d) => d)

    // Row labels
    g.append('g')
      .selectAll('text')
      .data(rows)
      .enter()
      .append('text')
      .attr('x', -12)
      .attr('y', (d) => y(d)! + y.bandwidth() / 2)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('fill', '#26241F')
      .text((d) => d)

    // Cells
    g.selectAll('rect.cell')
      .data(cells)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => x(d.col)!
      )
      .attr('y', (d) => y(d.row)!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', '#EFE9DA')
      .attr('opacity', 0)
      .transition()
      .duration(700)
      .delay((d) => cols.indexOf(d.col) * 70 + rows.indexOf(d.row) * 20)
      .ease(d3.easeCubicOut)
      .attr('opacity', 1)
      .attr('fill', (d) => color(d.value))
  }, [cells, rows, cols, width])

  return (
    <div ref={ref} className="w-full">
      <svg ref={svgRef} width={width} className="d3-chart" />
    </div>
  )
}
