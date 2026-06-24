import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import type { Observation } from '@/types'
import { photoUrl, pickPhoto } from '@/lib/photos'
import { iconColor } from '@/data/taxonomy'

// leaflet.heat attaches `heatLayer` to the L namespace at runtime.
type LeafletHeat = typeof L & {
  heatLayer?: (latlngs: [number, number, number][], opts?: unknown) => L.Layer
}

type MapMode = 'markers' | 'heat'

export interface ObservationMapProps {
  observations: Observation[]
  mode?: MapMode
  /** When changed, the map flies to this [lat, lng] with an organic transition. */
  flyTo?: { center: [number, number]; zoom?: number; key: string | number }
  /** Override the default world view. */
  initialCenter?: [number, number]
  initialZoom?: number
  className?: string
  /** Render observation popups on click (markers mode only). */
  interactive?: boolean
}

const WORLD_VIEW: [number, number] = [22, 10]
const WORLD_ZOOM = 2

/**
 * A controlled Leaflet wrapper with a soft, cinematic feel:
 *  - gentle fly-to transitions when the focus changes
 *  - warm earth-toned tile filter
 *  - optional heatmap layer
 *
 * Leaflet is initialized imperatively (no react-leaflet) so we have full
 * control over animations and lifecycle.
 */
export function ObservationMap({
  observations,
  mode = 'markers',
  flyTo,
  initialCenter = WORLD_VIEW,
  initialZoom = WORLD_ZOOM,
  className,
  interactive = true,
}: ObservationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const heatRef = useRef<L.Layer | null>(null)

  // --- Initialize the map once ---
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      // Default zoom control sits top-left, hidden behind the solid navbar.
      // We add it at top-right instead (CSS nudges it below the navbar).
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: true,
      scrollWheelZoom: true,
      preferCanvas: true,
    })
    L.control.zoom({ position: 'topright' }).addTo(map)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertile/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      },
    ).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // Ensure correct sizing after mount.
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Draw observations ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !layerRef.current) return

    // Clear previous markers
    layerRef.current.clearLayers()
    if (heatRef.current) {
      map.removeLayer(heatRef.current)
      heatRef.current = null
    }

    const points = observations
      .map((o) => {
        const lat = o.latitude ?? Number(o.location?.split(',')[0])
        const lng = o.longitude ?? Number(o.location?.split(',')[1])
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return { lat, lng, obs: o }
      })
      .filter((p): p is { lat: number; lng: number; obs: Observation } => p !== null)

    if (mode === 'heat') {
      const heatData = points.map(
        (p) => [p.lat, p.lng, 0.6] as [number, number, number],
      )
      const heatL = L as unknown as LeafletHeat
      if (heatL.heatLayer && heatData.length) {
        heatRef.current = heatL
          .heatLayer(heatData, {
            radius: 22,
            blur: 18,
            maxZoom: 10,
            minOpacity: 0.25,
            gradient: {
              0.2: '#A8B59B',
              0.45: '#6B8A62',
              0.7: '#33513E',
              1.0: '#243B2C',
            },
          })
          .addTo(map)
      }
      // Even in heat mode, add subtle clickable markers when interactive.
      if (interactive) {
        for (const p of points.slice(0, 400)) {
          addCircleMarker(p.lat, p.lng, p.obs, layerRef.current!)
        }
      }
    } else {
      for (const p of points.slice(0, 600)) {
        addCircleMarker(p.lat, p.lng, p.obs, layerRef.current!)
      }
    }
  }, [observations, mode, interactive])

  // --- Cinematic fly-to ---
  useEffect(() => {
    const map = mapRef.current
    if (!map || !flyTo) return
    map.flyTo(flyTo.center, flyTo.zoom ?? 5, {
      duration: 2.4,
      easeLinearity: 0.25,
    })
  }, [flyTo?.key, flyTo?.center, flyTo?.zoom])

  return <div ref={containerRef} className={className} />
}

function addCircleMarker(
  lat: number,
  lng: number,
  obs: Observation,
  layer: L.LayerGroup,
) {
  const color = iconColor(obs.taxon?.iconic_taxon_name)
  const marker = L.circleMarker([lat, lng], {
    radius: 5,
    weight: 1,
    color: '#F6F2E8',
    fillColor: color,
    fillOpacity: 0.85,
    opacity: 0.9,
  })

  const thumb = pickPhoto(obs.photos?.[0], 'medium')
  const common = obs.taxon?.preferred_common_name || 'Unknown'
  const sci = obs.taxon?.name
  const html = `
    <div style="width:180px;font-family:Inter,sans-serif">
      ${
        thumb
          ? `<img src="${photoUrl(thumb, 'medium')}" alt="${common}" style="width:100%;height:96px;object-fit:cover;border-radius:8px 8px 0 0"/>`
          : ''
      }
      <div style="padding:8px 10px">
        <div style="font-size:13px;font-weight:600;color:#26241F;line-height:1.25">${common}</div>
        <div style="font-size:11px;font-style:italic;color:#54514A;margin-top:2px">${sci || ''}</div>
        <div style="font-size:10px;color:#8A8378;margin-top:6px">${obs.place_guess || ''}</div>
      </div>
    </div>`
  marker.bindPopup(html, { closeButton: false, minWidth: 180 })
  layer.addLayer(marker)
}
