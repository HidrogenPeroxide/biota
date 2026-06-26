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
  /**
   * When `key` changes, the camera automatically fits these [lat, lng] points
   * with a smooth cinematic animation — like a documentary surveying a region.
   * One point zooms in to ~15; a tight cluster fills comfortably; a wide
   * spread zooms out to show the whole distribution.
   */
  focus?: { points: [number, number][]; key: string | number }
  /** Override the default world view. */
  initialCenter?: [number, number]
  initialZoom?: number
  className?: string
  /** Render observation popups on click (markers mode only). */
  interactive?: boolean
  /** Show the atmospheric haze + slow cloud veil over the satellite tiles. */
  showAtmosphere?: boolean
  /**
   * Duration (seconds) of the auto-fit camera glide. Page-tuned for rhythm:
   * shorter for the working Explore map, longer for the cinematic Atlas page.
   */
  cameraDuration?: number
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
  focus,
  initialCenter = WORLD_VIEW,
  initialZoom = WORLD_ZOOM,
  className,
  interactive = true,
  showAtmosphere = true,
  cameraDuration = 1.4,
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

    // Base layer — satellite imagery for a National Geographic exploration feel.
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Imagery &copy; Esri, Maxar, Earthstar Geographics; observations &copy; iNaturalist contributors.',
        maxZoom: 18,
      },
    ).addTo(map)

    // Sparse reference overlay (place names + faint boundaries only) so the
    // view reads as an exploration map rather than a road navigator.
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        opacity: 0.5,
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

  // --- Cinematic auto-fit camera ---
  // Frame the selected group's observations like a documentary surveying a
  // region: compute the points' bounds and smoothly fly to them with generous
  // padding so nothing kisses the edges. Single point → close-up; tight
  // cluster → comfortable; wide spread → zoom out to fit all of it.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus || focus.points.length === 0) return

    const points = focus.points
    const single = points.length === 1

    if (single) {
      // One observation — a gentle close-up.
      map.flyTo(points[0], 15, {
        duration: cameraDuration,
        easeLinearity: 0.3,
      })
      return
    }

    const bounds = L.latLngBounds(points)

    // Degenerate bounds (all points identical) → treat as a single point.
    if (bounds.getNorthWest().equals(bounds.getSouthEast())) {
      map.flyTo(points[0], 15, {
        duration: cameraDuration,
        easeLinearity: 0.3,
      })
      return
    }

    map.flyToBounds(bounds, {
      padding: [100, 100], // ~100px breathing room on every side
      maxZoom: 16, // never get uncomfortably close on a tight cluster
      duration: cameraDuration, // page-tuned cinematic glide
      easeLinearity: 0.3,
    })
  }, [focus?.key, cameraDuration])

  return (
    <div className={`relative ${className ?? ''}`}>
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {showAtmosphere && (
        <div className="map-atmosphere absolute inset-0" aria-hidden="true">
          <div className="map-haze" />
          <div className="map-clouds" />
        </div>
      )}
    </div>
  )
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
