import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────
export type InfraLayerKey = 'roads' | 'waterways' | 'flood_zones'

export interface InfraLayerConfig {
  key: InfraLayerKey
  label: string
  color: string
  lineWidth: number
  lineOpacity: number
  fillColor?: string
  fillOpacity?: number
  type: 'line' | 'fill-and-line'
  dotClass: string
  activeClass: string
}

export const INFRA_LAYER_CONFIG: InfraLayerConfig[] = [
  {
    key: 'roads',
    label: 'Routes',
    color: '#b45309',
    lineWidth: 1.5,
    lineOpacity: 0.7,
    type: 'line',
    dotClass: 'bg-amber-700',
    activeClass: 'border-amber-200 text-amber-800 bg-amber-50/50',
  },
  {
    key: 'waterways',
    label: 'Cours d\'eau',
    color: '#0284c7',
    lineWidth: 2,
    lineOpacity: 0.75,
    type: 'line',
    dotClass: 'bg-sky-600',
    activeClass: 'border-sky-200 text-sky-700 bg-sky-50/50',
  },
  {
    key: 'flood_zones',
    label: 'Zones inondables',
    color: '#0369a1',
    lineWidth: 1,
    lineOpacity: 0.5,
    fillColor: '#38bdf8',
    fillOpacity: 0.18,
    type: 'fill-and-line',
    dotClass: 'bg-blue-400',
    activeClass: 'border-blue-200 text-blue-700 bg-blue-50/50',
  },
]

// ── Overpass QL queries ─────────────────────────────────────────────────────

/**
 * Build an Overpass API query for a given bounding box.
 * bbox format: south,west,north,east (as required by Overpass)
 */
function buildOverpassQuery(bbox: string): string {
  // Roads: primary, secondary, tertiary, residential
  // Waterways: rivers, canals, streams, drains
  // Flood zones: natural=wetland + natural=water (polygons)
  return `
[out:json][timeout:25];
(
  way["highway"~"^(primary|secondary|tertiary|unclassified|residential)$"](${bbox});
  way["waterway"~"^(river|canal|stream|drain|ditch)$"](${bbox});
  relation["waterway"~"^(river|canal)$"](${bbox});
  way["natural"~"^(wetland|water)$"](${bbox});
  relation["natural"~"^(wetland|water)$"](${bbox});
);
out body geom;
`.trim()
}

/** Convert Overpass JSON response to GeoJSON FeatureCollection per layer */
function parseOverpassResponse(data: any): Record<InfraLayerKey, GeoJSON.FeatureCollection> {
  const roads: GeoJSON.Feature[] = []
  const waterways: GeoJSON.Feature[] = []
  const flood_zones: GeoJSON.Feature[] = []

  for (const element of data.elements ?? []) {
    if (!element.geometry && !element.members) continue

    const tags = element.tags ?? {}
    const hw = tags.highway
    const ww = tags.waterway
    const nat = tags.natural

    // Build coordinates from geometry
    let coords: [number, number][] = []
    if (element.geometry) {
      coords = element.geometry.map((pt: { lat: number; lon: number }) => [pt.lon, pt.lat])
    } else if (element.members) {
      // relation: collect ways
      for (const m of element.members) {
        if (m.type === 'way' && m.geometry) {
          coords = [...coords, ...m.geometry.map((pt: { lat: number; lon: number }) => [pt.lon, pt.lat])]
        }
      }
    }

    if (coords.length < 2) continue

    if (hw) {
      roads.push({
        type: 'Feature',
        properties: { highway: hw, name: tags.name },
        geometry: { type: 'LineString', coordinates: coords },
      })
    } else if (ww) {
      waterways.push({
        type: 'Feature',
        properties: { waterway: ww, name: tags.name },
        geometry: { type: 'LineString', coordinates: coords },
      })
    } else if (nat === 'wetland' || nat === 'water') {
      // Polygon if first ≈ last
      const isClosed =
        coords.length >= 4 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1]

      flood_zones.push({
        type: 'Feature',
        properties: { natural: nat, name: tags.name },
        geometry: isClosed
          ? { type: 'Polygon', coordinates: [coords] }
          : { type: 'LineString', coordinates: coords },
      })
    }
  }

  return {
    roads: { type: 'FeatureCollection', features: roads },
    waterways: { type: 'FeatureCollection', features: waterways },
    flood_zones: { type: 'FeatureCollection', features: flood_zones },
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────

interface UseInfrastructureLayersOptions {
  /** Geographic bounds [south, west, north, east] */
  bounds?: [number, number, number, number] | null
  enabled?: boolean
}

interface UseInfrastructureLayersResult {
  infraGeoJson: Partial<Record<InfraLayerKey, GeoJSON.FeatureCollection>>
  infraLoading: boolean
  infraError: string | null
  refetch: () => void
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export function useInfrastructureLayers({
  bounds,
  enabled = true,
}: UseInfrastructureLayersOptions): UseInfrastructureLayersResult {
  const [infraGeoJson, setInfraGeoJson] = useState<
    Partial<Record<InfraLayerKey, GeoJSON.FeatureCollection>>
  >({})
  const [infraLoading, setInfraLoading] = useState(false)
  const [infraError, setInfraError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastBoundsRef = useRef<string>('')

  const fetchInfra = useCallback(async (b: [number, number, number, number]) => {
    const bboxStr = b.join(',') // south,west,north,east
    if (bboxStr === lastBoundsRef.current) return
    lastBoundsRef.current = bboxStr

    // Cancel previous
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setInfraLoading(true)
    setInfraError(null)

    try {
      const query = buildOverpassQuery(bboxStr)
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: ctrl.signal,
      })

      if (!res.ok) throw new Error(`Overpass: ${res.status}`)
      const data = await res.json()
      const parsed = parseOverpassResponse(data)
      setInfraGeoJson(parsed)
    } catch (err: any) {
      if (err?.name === 'AbortError') return // Normal cancel
      console.error('[useInfrastructureLayers] Erreur:', err)
      setInfraError('Impossible de charger les données d\'infrastructure (Overpass).')
    } finally {
      if (!ctrl.signal.aborted) setInfraLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !bounds) return
    fetchInfra(bounds)
    return () => { abortRef.current?.abort() }
  }, [enabled, bounds, fetchInfra])

  return {
    infraGeoJson,
    infraLoading,
    infraError,
    refetch: () => bounds && fetchInfra(bounds),
  }
}
