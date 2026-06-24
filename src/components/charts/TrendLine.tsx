import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useElementWidth } from './useChart'

export interface TrendPoint {
  x: string | number
  y: number
}

interface TrendLineProps {
  data: TrendPoint[]
  height?: number
  xLabel?: string
  yLabel?: string
  /** Format the y-axis tick value. */
  yFormat?: (v: number) => string
}

/**
 * Smooth area + line chart with a draw-in animation. Used for observation
 * trends over time. The line traces on with a path-length transition while the
 * area fills beneath it.
 */
export function TrendLine({
  data,
  height = 320,
  xLabel,
  yFormat = (v) => d3.format('~s')(v),
}: TrendLineProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!width || !svgRef.current || data.length < 2) return
    const margin = { top: 20, right: 20, bottom: 36, left: 52 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3
      .scalePoint()
      .domain(data.map((d) => String(d.x)))
      .range([0, w])
      .padding(0.2)

    const yMax = d3.max(data, (d) => d.y) ?? 1
    const y = d3.scaleLinear().domain([0, yMax * 1.1]).range([h, 0]).nice()

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(x.domain().filter((_, i) => i % Math.ceil(data.length / 8) === 0)),
      )
      .call((sel) => sel.selectAll('text').attr('font-size', 11))
      .selectAll('.domain, .tick line')
      .remove()

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(yFormat as any))
      .call((sel) => sel.selectAll('.domain, .tick line').remove())
      .selectAll('text')
      .attr('font-size', 11)

    // Gridlines
    g.append('g')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#C8BDA7')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-dasharray', '2 4')

    // Area
    const area = d3
      .area<TrendPoint>()
      .x((d) => x(String(d.x))!)
      .y0(h)
      .y1((d) => y(d.y))
      .curve(d3.curveCatmullRom.alpha(0.6))

    const line = d3
      .line<TrendPoint>()
      .x((d) => x(String(d.x))!)
      .y((d) => y(d.y))
      .curve(d3.curveCatmullRom.alpha(0.6))

    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'trend-grad')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', 1)
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#4E6B47').attr('stop-opacity', 0.35)
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#4E6B47').attr('stop-opacity', 0.02)

    const areaPath = g
      .append('path')
      .datum(data)
      .attr('d', area)
      .attr('fill', 'url(#trend-grad)')
      .attr('opacity', 0)

    const linePath = g
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#243B2C')
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round')

    const totalLength = (linePath.node() as SVGPathElement).getTotalLength()
    linePath
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1800)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)

    areaPath
      .transition()
      .delay(400)
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('opacity', 1)

    // End-point dot
    const last = data[data.length - 1]
    g.append('circle')
      .attr('cx', x(String(last.x))!)
      .attr('cy', y(last.y))
      .attr('r', 0)
      .attr('fill', '#243B2C')
      .attr('stroke', '#F6F2E8')
      .attr('stroke-width', 2)
      .transition()
      .delay(1700)
      .duration(500)
      .attr('r', 4.5)
  }, [data, width, height])

  return (
    <div ref={ref} className="w-full">
      <svg ref={svgRef} width={width} height={height} className="d3-chart" />
      {xLabel && (
        <p className="mt-1 text-center text-xs text-charcoal-soft">{xLabel}</p>
      )}
    </div>
  )
}
