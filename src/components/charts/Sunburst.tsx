import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useElementWidth } from './useChart'
import type { TreemapDatum } from './Treemap'

interface SunburstProps {
  data: TreemapDatum
  size?: number
  onHover?: (d: { name: string; value: number } | null) => void
}

/**
 * D3 sunburst (radial partition) — concentric rings of the taxonomy, useful
 * for showing how a group breaks down into its families/species. Arcs sweep
 * in with an organic angular reveal.
 */
export function Sunburst({ data, size = 380, onHover }: SunburstProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!width || !svgRef.current) return
    const radius = size / 2
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    svg.attr('viewBox', `${-radius} ${-radius} ${size} ${size}`)

    const root = d3
      .hierarchy<TreemapDatum>(data, (d) => d.children)
      .sum((d) => Math.max(0, d.value ?? 0))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    d3.partition<TreemapDatum>().size([2 * Math.PI, radius])(root)

    const arc = d3
      .arc<d3.HierarchyRectangularNode<TreemapDatum>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle(0.006)
      .padRadius(radius / 2)
      .innerRadius((d) => Math.max(0, d.y0))
      .outerRadius((d) => Math.max(0, d.y1 - 1))

    const descendants = root.descendants() as d3.HierarchyRectangularNode<TreemapDatum>[]
    svg
      .selectAll('path')
      .data(descendants.filter((d) => d.depth > 0))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => {
        const top = d.ancestors().reverse()[1]
        return d.data.color || top?.data.color || '#4E6B47'
      })
      .attr('stroke', '#F6F2E8')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      .on('mouseenter', (_e, d) =>
        onHover?.({ name: d.data.name, value: d.value ?? 0 }),
      )
      .on('mouseleave', () => onHover?.(null))
      .transition()
      .duration(1000)
      .delay((d) => d.depth * 180 + (d.x0 / (2 * Math.PI)) * 200)
      .ease(d3.easeCubicOut)
      .attr('opacity', 0.92)

    // Center label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-family', 'Fraunces, serif')
      .attr('font-size', 16)
      .attr('fill', '#243B2C')
      .text(data.name)
  }, [data, width, size, onHover])

  return (
    <div ref={ref} className="flex w-full justify-center">
      <svg ref={svgRef} width={Math.min(width || size, size)} className="d3-chart" />
    </div>
  )
}
