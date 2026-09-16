import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'

import { cn } from '@/modules/shared/lib/utils'

const osmStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap | MapLibre',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

/** Small, non-interactive-ish map that centers on a coordinate with a marker. */
export function LocationMap({
  lat,
  lng,
  className,
}: {
  lat: number
  lng: number
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: create the map once; a separate effect recenters it.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmStyle,
      center: [lng, lat],
      zoom: 15,
      attributionControl: false,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    markerRef.current = new maplibregl.Marker({ color: '#403bad' }).setLngLat([lng, lat]).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // Recenter + move the marker when the coordinate changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setCenter([lng, lat])
    markerRef.current?.setLngLat([lng, lat])
  }, [lat, lng])

  return (
    <div ref={containerRef} className={cn('h-56 w-full overflow-hidden rounded-md', className)} />
  )
}
