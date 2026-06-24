import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useElementWidth } from './useChart'

export interface BarDatum {
  label: string
  value: number
  sub?: string
  href?: string
  color?: string
}

interface BarListProps {
  data: BarDatum[]
  /** Format the value shown at the bar's end. */
  format?: (v: number) => string
  onSelect?: (d: BarDatum) => void
}

/**
 * Horizontal bar list — used for "most observed species" / top contributors.
 * Bars grow from the left with a staggered, organic ease.
 */
export function BarList({
  data,
  format = (v) => d3.format('~s')(v),
  onSelect,
}: BarListProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)
  const rowH = 44
  const height = data.length * rowH + 8

  useEffect(() => {
    if (!width || !svgRef.current || !data.length) return
    const labelW = 170
    const valueW = 64
    const margin = { top: 6, right: valueW, bottom: 6, left: labelW }
    const w = width - margin.left - margin.right
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const max = d3.max(data, (d) => d.value) ?? 1
    const x = d3.scaleLinear().domain([0, max]).range([0, w]).nice()

    const y = d3
      .scaleBand()
      .domain(data.map((_, i) => String(i)))
      .range([0, data.length * rowH])
      .padding(0.25)

    // Track
    g.selectAll('rect.track')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'track')
      .attr('x', 0)
      .attr('y', (_, i) => y(String(i))!)
      .attr('width', w)
      .attr('height', y.bandwidth())
      .attr('rx', y.bandwidth() / 2)
      .attr('fill', '#EFE9DA')

    // Bars
    g.selectAll('rect.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (_, i) => y(String(i))!)
      .attr('height', y.bandwidth())
      .attr('rx', y.bandwidth() / 2)
      .attr('fill', (d) => d.color || '#33513E')
      .attr('width', 0)
      .style('cursor', onSelect ? 'pointer' : 'default')
      .on('click', (_e, d) => onSelect?.(d))
      .transition()
      .duration(1100)
      .delay((_, i) => i * 90)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => x(d.value))

    // Labels (outside, in left margin)
    svg
      .selectAll('text.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', margin.left - 12)
      .attr('y', (_, i) => y(String(i))! + y.bandwidth() / 2 + margin.top)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('font-size', 12)
      .attr('fill', '#26241F')
      .each(function (d) {
        const sel = d3.select(this)
        const [main, ...rest] = d.label.split(' — ')
        sel.append('tspan').attr('font-weight', 600).text(trunc(main, 22))
        if (rest.length || d.sub) {
          sel
            .append('tspan')
            .attr('x', margin.left - 12)
            .attr('dy', 14)
            .attr('font-size', 10)
            .attr('font-style', 'italic')
            .attr('fill', '#8A8378')
            .text(trunc(rest.join(' — ') || d.sub || '', 26))
        }
      })

    // Values
    svg
      .selectAll('text.value')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', width - margin.right + 8)
      .attr('y', (_, i) => y(String(i))! + y.bandwidth() / 2 + margin.top)
      .attr('dy', '0.32em')
      .attr('font-size', 11)
      .attr('fill', '#54514A')
      .attr('opacity', 0)
      .text((d) => format(d.value))
      .transition()
      .delay((_, i) => 500 + i * 90)
      .duration(600)
      .attr('opacity', 1)
  }, [data, width, onSelect, format])

  return (
    <div ref={ref} className="w-full">
      <svg ref={svgRef} width={width} height={height} className="d3-chart" />
    </div>
  )
}

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
