import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Map, { Marker, Source, Layer, NavigationControl, Popup } from 'react-map-gl/maplibre'
import type { ViewStateChangeEvent, MapMouseEvent } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'


import { territoryApi } from '../../feature/territory/services/territory.api'
import { useTerritoryMapScope } from '../../feature/territory/hooks/useTerritoryMapScope'
import { presetForRoles, layersForPreset } from '../../feature/territory/services/mapLayerPresets'
import { useAuthRoles } from '../../feature/auth/hooks/useAuthRoles'
import { User_Role } from '../../feature/auth/services/auth.types'


import {
  TERRITORY_LAYER_CONFIG,
  type TerritoryLayerKey,
} from '../../feature/territory/components/territorialMapShared'
import {
  useInfrastructureLayers,
  INFRA_LAYER_CONFIG,
  type InfraLayerKey,
} from '../../feature/territory/hooks/useInfrastructureLayers'
import type { GeoJsonFeatureCollection } from '../../feature/territory/services/territory.types'
import LoadingSpinner from '../ui/LoadingSpinner'
import UnifiedMapLegend from './UnifiedMapLegend'
import { useGetLayersQuery } from '../../feature/gis/services/gis.rtk'

const GIS_LAYER_COLORS: Record<string, string> = {
  water_network: '#059669',
  drainage: '#06b6d4',
  roads: '#6b7280',
  flood_zones: '#ef4444',
  electricity: '#f59e0b',
  buildings: '#8b5cf6',
  vegetation: '#22c55e',
  other: '#94a3b8',
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IncidentPin {
  id: string
  title: string
  category: string
  priority: string
  lat: number
  lng: number
  municipalityId?: string
  district?: string
  regionName?: string
  municipalityName?: string
  districtName?: string
  neighborhoodName?: string
  reporter?: string
  reporterRole?: string        /** Libellé humain du rôle (ex: "Technicien terrain") */
  reporterRoleCode?: string    /** Code brut du rôle (ex: "technician") */
  details?: string
  date?: string
}


export interface MissionPin {
  id: string
  title: string
  missionType: string
  status: string
  priority: string
  lat: number
  lng: number
  assignedTeamName?: string
  scheduledAt?: string
  description?: string
}

export interface TeamLocation {
  team_id: string
  team_name: string
  latitude: number
  longitude: number
  check_in_time: string
}

export interface UnifiedMapProps {
  /** Données d'incidents à afficher (clustering automatique). */
  incidentsData?: IncidentPin[]
  /** Données des missions terrain à afficher. */
  missionsData?: MissionPin[]
  /** Données GPS des équipes terrain à afficher. */
  teamsData?: TeamLocation[]
  /** Hauteur de la carte. */
  height?: string
  /** Callback quand l'utilisateur clique sur un pin d'incident. */
  onIncidentClick?: (pin: IncidentPin) => void
  /** Callback quand l'utilisateur clique sur un marqueur de mission. */
  onMissionClick?: (pin: MissionPin) => void
  /** Callback quand l'utilisateur clique sur un marqueur d'équipe. */
  onTeamClick?: (team: TeamLocation) => void
  /** Callback quand l'utilisateur clique sur un endroit vide de la carte. */
  onMapClick?: (lat: number, lng: number) => void
  /** Position d'un marqueur personnalisé (ex: cible pour un formulaire). */
  customMarker?: { lat: number; lng: number } | null
  /** Forcer le centre de la carte (utile pour zoomer sur une adresse ou GPS). */
  center?: { lat: number; lng: number; zoom?: number } | null
  /** Masquer le panneau de légende/filtres. */
  hideLegend?: boolean
  /** Forcer certaines couches actives au départ. */
  defaultActiveLayers?: TerritoryLayerKey[]
  /** Activer les couches d'infrastructure OSM (routes, cours d'eau, zones inondables). */
  showInfraLayers?: boolean
}

// ── Style raster (CARTO) ───────────────────────────────────────────────────────
export const MAP_STYLE_RASTER = {
  version: 8,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sprite: 'https://openmaptiles.github.io/osm-bright-gl-style/sprite',
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [{ id: 'simple-tiles', type: 'raster', source: 'raster-tiles' }],
}

// ── Couleur par catégorie/niveau de risque ─────────────────────────────────────
export function getCategoryColor(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'flooding': return '#f43f5e' // rose-500
    case 'drainage': return '#f59e0b' // amber-500
    case 'road': return '#3b82f6' // blue-500
    case 'waste': return '#8b5cf6' // purple-500
    case 'biodiversity': return '#10b981' // emerald-500
    case 'lighting': return '#eab308' // yellow-500
    default: return '#6b7280' // gray-500
  }
}

export function getRiskColorHex(level?: string): string {
  switch (level?.toLowerCase()) {
    case 'critical':
    case 'high':
      return '#ef4444' // rouge (danger)
    case 'medium':
    case 'urgent':
      return '#eab308' // jaune (urgent)
    case 'low':
      return '#22c55e' // vert (moins dangereux)
    default:
      return '#059669' // vert
  }
}

export function getMissionStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'draft': return '#9ca3af' // gray-400
    case 'planned': return '#60a5fa' // blue-400
    case 'assigned': return '#818cf8' // indigo-400
    case 'in_progress': return '#f59e0b' // amber-500
    case 'completed': return '#34d399' // emerald-400
    case 'validated': return '#10b981' // emerald-500
    case 'cancelled': return '#f87171' // red-400
    default: return '#9ca3af'
  }
}

// ── Icônes ─────────────────────────────────────────────────────────────────────
const LiveLocationIcon = () => (
  <div
    className="relative flex items-center justify-center w-6 h-6 pointer-events-none"
    style={{ transform: 'translate(-50%, -50%)' }}
  >
    <div className="absolute w-full h-full bg-emerald-500 rounded-full opacity-40 animate-ping" />
    <div className="relative w-3.5 h-3.5 bg-emerald-600 border-2 border-white rounded-full shadow-md" />
  </div>
)

const TeamMarkerIcon = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center pointer-events-none" style={{ transform: 'translate(-50%, -100%)' }}>
    <div className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-emerald-100 mb-1">
      <p className="text-sm font-medium text-emerald-800 whitespace-nowrap max-w-[80px] truncate">{name}</p>
    </div>
    <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-md">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </div>
  </div>
)

const MissionMarkerIcon = ({ status, title }: { status: string; title: string }) => {
  const color = getMissionStatusColor(status)
  return (
    <div className="flex flex-col items-center pointer-events-none" style={{ transform: 'translate(-50%, -100%)' }}>
      <div className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-blue-100 mb-1">
        <p className="text-sm font-medium text-blue-800 whitespace-nowrap max-w-[100px] truncate">{title}</p>
      </div>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md"
        style={{ backgroundColor: color }}
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      </div>
    </div>
  )
}

// ── Calcul des bounds ──────────────────────────────────────────────────────────
function calculateBounds(
  collections: Partial<Record<TerritoryLayerKey, GeoJsonFeatureCollection>>
): [[number, number], [number, number]] | null {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity
  let has = false

  const extend = (coord: [number, number]) => {
    if (coord[0] < minLng) minLng = coord[0]
    if (coord[1] < minLat) minLat = coord[1]
    if (coord[0] > maxLng) maxLng = coord[0]
    if (coord[1] > maxLat) maxLat = coord[1]
    has = true
  }

  const walk = (coords: any[]) => {
    if (!coords) return
    if (typeof coords[0] === 'number') extend(coords as [number, number])
    else coords.forEach(walk)
  }

  Object.values(collections).forEach((col) => {
    col?.features?.forEach((f: any) => f?.geometry?.coordinates && walk(f.geometry.coordinates))
  })

  return has ? [[minLng, minLat], [maxLng, maxLat]] : null
}

// ── Composant principal ────────────────────────────────────────────────────────
const UnifiedMap = ({
  incidentsData,
  missionsData,
  teamsData,
  height = '400px',
  onIncidentClick,
  onMissionClick,
  onTeamClick,
  onMapClick,
  customMarker,
  center,
  hideLegend = false,
  defaultActiveLayers,
  showInfraLayers = false,
}: UnifiedMapProps) => {
  const { roles } = useAuthRoles()
  const scope = useTerritoryMapScope()

  // ── Couches autorisées selon le rôle ──────────────────────────────────────
  const preset = presetForRoles(roles as User_Role[])
  const allowedLayers = useMemo(() => layersForPreset(preset), [preset])

  const [activeLayers, setActiveLayers] = useState<TerritoryLayerKey[]>(
    defaultActiveLayers ?? allowedLayers
  )

  // ── Infrastructure layers state (routes, waterways, flood zones) ─────────────
  const [activeInfraLayers, setActiveInfraLayers] = useState<InfraLayerKey[]>(
    showInfraLayers ? ['roads', 'waterways', 'flood_zones'] : []
  )
  // Bounding box [south, west, north, east] of the current map view
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null)
  const { infraGeoJson, infraLoading } = useInfrastructureLayers({
    bounds: mapBounds,
    enabled: showInfraLayers && activeInfraLayers.length > 0,
  })

  const toggleInfraLayer = useCallback((key: InfraLayerKey) => {
    setActiveInfraLayers((prev) =>
      prev.includes(key) ? prev.filter((l) => l !== key) : [...prev, key]
    )
  }, [])

  // ── Couches GIS personnalisées (RTK Query) ──────────────────────────────
  const { data: gisLayers = [] } = useGetLayersQuery()
  const [activeGisLayerIds, setActiveGisLayerIds] = useState<string[]>([])
  const [gisGeoJsonCache, setGisGeoJsonCache] = useState<Record<string, GeoJSON.FeatureCollection>>({})

  // Chargement paresseux du GeoJSON pour les couches activées (via RTK Query lazy queries)
  useEffect(() => {
    let cancelled = false
    const loadSequentially = async () => {
      for (const id of activeGisLayerIds) {
        if (cancelled || gisGeoJsonCache[id]) continue
        try {
          const response = await fetch(`/api/gis/${id}/geojson`)
          const json = await response.json()
          if (!cancelled && json.success) {
            setGisGeoJsonCache(prev => ({ ...prev, [id]: json.data }))
          }
        } catch (e) {
          console.warn(`[GIS] Erreur chargement couche ${id}:`, e)
        }
      }
    }
    loadSequentially()
    return () => { cancelled = true }
  }, [activeGisLayerIds])


  const toggleGisLayer = useCallback((id: string) => {
    setActiveGisLayerIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }, [])

  // ── État carte ────────────────────────────────────────────────────────────
  const [mapZoom, setMapZoom] = useState(7)
  const mapRef = useRef<any>(null)
  const fittedRef = useRef(false)

  // ── GeoJSON territorial ───────────────────────────────────────────────────
  const [territoryGeoJson, setTerritoryGeoJson] = useState<
    Partial<Record<TerritoryLayerKey, GeoJsonFeatureCollection>>
  >({})
  const [loading, setLoading] = useState(true)
  const versionRef = useRef<Partial<Record<TerritoryLayerKey, number>>>({})
  const bumpVersion = (key: TerritoryLayerKey) => {
    versionRef.current[key] = (versionRef.current[key] ?? 0) + 1
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        // Chargement filtré par périmètre utilisateur (scope)
        const data = await territoryApi.fetchLayersGeoJson(allowedLayers, scope)
        if (cancelled) return
        allowedLayers.forEach((l) => bumpVersion(l))
        setTerritoryGeoJson(data)
      } catch (err) {
        if (cancelled) return
        console.error('[UnifiedMap] Erreur chargement couches:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [allowedLayers, scope])

  // ── Localisation en direct ─────────────────────────────────────────────────
  const [liveLocation, setLiveLocation] = useState<[number, number] | null>(null)
  useEffect(() => {
    if (!navigator.geolocation || !window.isSecureContext) return
    let watchId: number | null = null
    watchId = navigator.geolocation.watchPosition(
      (pos) => setLiveLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        if ((err.code === 2 || err.code === 0) && watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
          watchId = null
        }
      },
      { enableHighAccuracy: false, maximumAge: 10000, timeout: 20000 }
    )
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // ── Auto-fit au chargement ──────────────────────────────────────────────
  useEffect(() => {
    if (loading || fittedRef.current || !mapRef.current) return
    const bounds = calculateBounds(territoryGeoJson)
    if (bounds) {
      mapRef.current.fitBounds(bounds, { padding: 30, maxZoom: 12, duration: 1000 })
      fittedRef.current = true
      // Capture bounds for infrastructure loading
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
      if (map && showInfraLayers) {
        const b = map.getBounds()
        if (b) {
          setMapBounds([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()])
        }
      }
    }
  }, [loading, territoryGeoJson, showInfraLayers])

  // ── Forcer le centre ───────────────────────────────────────────────────────
  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.easeTo({
        center: [center.lng, center.lat],
        zoom: center.zoom ?? mapRef.current.getZoom(),
        duration: 1000,
      })
    }
  }, [center])

  // ── GeoJSON incidents ──────────────────────────────────────────────────────
  const incidentsGeoJSON = useMemo<GeoJSON.FeatureCollection | null>(() => {
    if (!incidentsData?.length) return null
    return {
      type: 'FeatureCollection',
      features: incidentsData.map((pin) => ({
        type: 'Feature',
        properties: { 
          color: getCategoryColor(pin.category), 
          riskColor: getRiskColorHex(pin.priority),
          ...pin 
        },
        geometry: { type: 'Point', coordinates: [pin.lng, pin.lat] },
      })),
    }
  }, [incidentsData])

  // ── Couches visibles (filtrées par activeLayers) ────────────────────────────
  const visibleLayers = useMemo(
    () =>
      TERRITORY_LAYER_CONFIG.filter(
        (cfg) =>
          allowedLayers.includes(cfg.key) &&
          activeLayers.includes(cfg.key) &&
          Boolean(territoryGeoJson[cfg.key]?.features?.length)
      ),
    [allowedLayers, activeLayers, territoryGeoJson]
  )

  const handleZoom = useCallback((e: ViewStateChangeEvent) => {
    setMapZoom(e.viewState.zoom)
  }, [])


  // ── Popup survol signalement ──────────────────────────────────────────
  const [hoveredPin, setHoveredPin] = useState<IncidentPin | null>(null)
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (!incidentsData?.length) return
      if (!e.features?.length) {
        setHoveredPin(null)
        setHoveredCoords(null)
        return
      }
      const f = e.features[0]
      if (f.layer.id === 'incidents-unclustered') {
        const pin = incidentsData.find((p) => p.id === f.properties?.id)
        if (pin) {
          setHoveredPin(pin)
          setHoveredCoords({ x: e.point.x, y: e.point.y })
        }
      }
    },
    [incidentsData]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredPin(null)
    setHoveredCoords(null)
  }, [])

  const toggleLayer = useCallback((key: TerritoryLayerKey) => {
    setActiveLayers((prev) =>
      prev.includes(key) ? prev.filter((l) => l !== key) : [...prev, key]
    )
  }, [])

  const isRelativeHeight =

    typeof height === 'string' && (height.includes('%') || height.startsWith('calc('))

  return (
    <div className={`flex flex-col gap-3 w-full ${isRelativeHeight ? 'h-full flex-1' : ''}`} style={isRelativeHeight ? { height } : undefined}>
      {/* Légende */}
      {!hideLegend && (
        <UnifiedMapLegend
          allowedLayers={allowedLayers}
          activeLayers={activeLayers}
          onToggle={toggleLayer}
          territoryGeoJson={territoryGeoJson}
          mapZoom={mapZoom}
          incidentCount={incidentsData?.length ?? 0}
          missionCount={missionsData?.length ?? 0}
          teamCount={teamsData?.length ?? 0}
          showInfraLayers={showInfraLayers}
          activeInfraLayers={activeInfraLayers}
          onToggleInfra={toggleInfraLayer}
          infraLoading={infraLoading}
          infraGeoJson={infraGeoJson}
        />
      )}

      {/* Panneau couches GIS */}
      {gisLayers.length > 0 && !hideLegend && (
        <div className="flex flex-col gap-4 p-4 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl mb-2 -mt-1">
          <div>
            <h4 className="text-sm font-bold text-gray-400 mb-2">Couches SIG Additionnelles</h4>
            <div className="flex flex-wrap gap-2">
              {gisLayers.map((layer) => {
                const color = GIS_LAYER_COLORS[layer.layerType] ?? '#94a3b8'
                const active = activeGisLayerIds.includes(layer.id)
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleGisLayer(layer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                    }`}
                    style={active ? { backgroundColor: color } : {}}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : color }}
                    />
                    {layer.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Carte */}
      <div
        className={`relative border border-gray-200 rounded-2xl overflow-hidden z-0 w-full ${
          isRelativeHeight ? 'flex-1 min-h-[300px] sm:min-h-[400px]' : ''
        }`}
        style={isRelativeHeight ? undefined : { height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/70 z-50">
            <LoadingSpinner size="md" label="Chargement des données cartographiques…" />
          </div>
        )}

        <div className="absolute inset-0">
          <Map
            ref={mapRef}
            initialViewState={{ longitude: 2.3158, latitude: 9.3077, zoom: 7 }}
          mapStyle={MAP_STYLE_RASTER as any}
          style={{ height: '100%', width: '100%' }}
          onZoomEnd={handleZoom}
          interactiveLayerIds={incidentsGeoJSON ? ['incidents-unclustered', 'incidents-clusters'] : []}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {

            if (!e.features?.length) {
              if (onMapClick) onMapClick(e.lngLat.lat, e.lngLat.lng)
              return
            }
            const f = e.features[0]
            if (f.layer.id === 'incidents-unclustered') {
              const pin = incidentsData?.find((p) => p.id === f.properties?.id)
              if (pin) onIncidentClick?.(pin)
            } else if (f.layer.id === 'incidents-clusters') {
              const map = mapRef.current?.getMap()
              map?.easeTo({ center: e.lngLat, zoom: map.getZoom() + 2 })
            }
          }}
        >
          <NavigationControl position="top-right" />

          {/* Couches territoriales */}
          {visibleLayers.map((cfg) => {
            const data = territoryGeoJson[cfg.key]
            if (!data) return null
            const v = versionRef.current[cfg.key] ?? 0

            // Zoom minimum pour afficher les labels selon le niveau
            const labelMinZoom =
              cfg.key === 'regions' ? 5
              : cfg.key === 'municipalities' ? 7
              : cfg.key === 'districts' ? 9
              : 11

            // Taille du texte selon le niveau
            const labelSize =
              cfg.key === 'regions' ? 13
              : cfg.key === 'municipalities' ? 11
              : 10

            return (
              <Source key={`${cfg.key}-v${v}`} type="geojson" data={data as any}>
                <Layer
                  id={`${cfg.key}-fill`}
                  type="fill"
                  paint={{ 'fill-color': cfg.style.fillColor, 'fill-opacity': cfg.style.fillOpacity }}
                />
                <Layer
                  id={`${cfg.key}-line`}
                  type="line"
                  paint={{
                    'line-color': cfg.style.color,
                    'line-width': cfg.style.weight,
                    'line-opacity': cfg.style.opacity,
                  }}
                />
                <Layer
                  id={`${cfg.key}-label`}
                  type="symbol"
                  minzoom={labelMinZoom}
                  layout={{
                    'text-field': ['coalesce', ['get', 'name'], ''],
                    'text-font': ['Open Sans Bold', 'Open Sans Regular'],
                    'text-size': labelSize,
                    'text-anchor': 'center',
                    'text-max-width': 8,
                    'symbol-placement': 'point',
                  }}
                  paint={{
                    'text-color': cfg.style.color,
                    'text-halo-color': 'rgba(255, 255, 255, 0.9)',
                    'text-halo-width': 1.5,
                    'text-opacity': 0.95,
                  }}
                />
              </Source>
            )
          })}

          {/* ── Couches d'infrastructure OSM ── */}
          {showInfraLayers && INFRA_LAYER_CONFIG.filter(c => activeInfraLayers.includes(c.key)).map((cfg) => {
            const data = infraGeoJson[cfg.key]
            if (!data?.features?.length) return null
            return (
              <Source key={`infra-${cfg.key}`} type="geojson" data={data as any}>
                {cfg.type === 'fill-and-line' && (
                  <Layer
                    id={`infra-${cfg.key}-fill`}
                    type="fill"
                    filter={['==', ['geometry-type'], 'Polygon']}
                    paint={{
                      'fill-color': cfg.fillColor ?? cfg.color,
                      'fill-opacity': cfg.fillOpacity ?? 0.15,
                    }}
                  />
                )}
                <Layer
                  id={`infra-${cfg.key}-line`}
                  type="line"
                  paint={{
                    'line-color': cfg.color,
                    'line-width': cfg.lineWidth,
                    'line-opacity': cfg.lineOpacity,
                  }}
                />
              </Source>
            )
          })}

          {/* ── Couches GIS personnalisées ── */}
          {gisLayers
            .filter((layer) => activeGisLayerIds.includes(layer.id) && gisGeoJsonCache[layer.id])
            .map((layer) => {
              const color = GIS_LAYER_COLORS[layer.layerType] ?? '#94a3b8'
              const data = gisGeoJsonCache[layer.id]
              const geomType = data?.features?.[0]?.geometry?.type ?? ''
              const isPoint = geomType === 'Point' || geomType === 'MultiPoint'
              const isPoly = geomType === 'Polygon' || geomType === 'MultiPolygon'
              return (
                <Source key={`gis-${layer.id}`} type="geojson" data={data as any}>
                  {isPoly && (
                    <Layer
                      id={`gis-${layer.id}-fill`}
                      type="fill"
                      paint={{ 'fill-color': color, 'fill-opacity': 0.18 }}
                    />
                  )}
                  {!isPoint && (
                    <Layer
                      id={`gis-${layer.id}-line`}
                      type="line"
                      paint={{ 'line-color': color, 'line-width': 2, 'line-opacity': 0.85 }}
                    />
                  )}
                  {isPoint && (
                    <Layer
                      id={`gis-${layer.id}-circle`}
                      type="circle"
                      paint={{
                        'circle-color': color,
                        'circle-radius': 5,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#ffffff',
                      }}
                    />
                  )}
                  {/* Label: affiche le nom si disponible */}
                  <Layer
                    id={`gis-${layer.id}-label`}
                    type="symbol"
                    minzoom={8}
                    layout={{
                      'text-field': [
                        'coalesce',
                        ['get', 'name'],
                        ['get', 'NAME_1'],
                        ['get', 'title'],
                        '',
                      ],
                      'text-font': ['Open Sans Bold', 'Open Sans Regular'],
                      'text-size': 10,
                      'text-anchor': isPoint ? 'top' : 'center',
                      'text-offset': isPoint ? [0, 0.8] : [0, 0],
                      'text-max-width': 8,
                    }}
                    paint={{
                      'text-color': color,
                      'text-halo-color': 'rgba(255, 255, 255, 0.95)',
                      'text-halo-width': 1.5,
                    }}
                  />
                </Source>
              )
            })}

          {/* Incidents clustérisés */}
          {incidentsGeoJSON && (
            <Source
              id="incidents-src"
              type="geojson"
              data={incidentsGeoJSON as any}
              cluster
              clusterMaxZoom={14}
              clusterRadius={50}
            >
              <Layer
                id="incidents-clusters"
                type="circle"
                filter={['has', 'point_count']}
                paint={{
                  'circle-color': [
                    'step', ['get', 'point_count'],
                    '#059669', 10, '#eab308', 30, '#ef4444',
                  ],
                  'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 30, 24],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                }}
              />
              <Layer
                id="incidents-cluster-count"
                type="symbol"
                filter={['has', 'point_count']}
                layout={{
                  'text-field': '{point_count_abbreviated}',
                  'text-font': ['Open Sans Bold', 'Open Sans Regular'],
                  'text-size': 12,
                }}
                paint={{ 'text-color': '#ffffff' }}
              />
              <Layer
                id="incidents-unclustered"
                type="circle"
                filter={['!', ['has', 'point_count']]}
                paint={{
                  'circle-color': ['get', 'color'],
                  'circle-radius': 7,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                }}
              />
            </Source>
          )}

          {/* Marqueurs de missions (drapeaux bleus) */}
          {missionsData?.map((mission) => (
            <Marker
              key={`mission-${mission.id}`}
              longitude={mission.lng}
              latitude={mission.lat}
              onClick={() => onMissionClick?.(mission)}
            >
              <MissionMarkerIcon status={mission.status} title={mission.title} />
            </Marker>
          ))}

          {/* Marqueurs GPS équipes */}
          {teamsData?.map((team) => (
            <Marker
              key={team.team_id}
              longitude={team.longitude}
              latitude={team.latitude}
              onClick={() => onTeamClick?.(team)}
            >
              <TeamMarkerIcon name={team.team_name} />
            </Marker>
          ))}

          {/* Marqueur personnalisé / formulaire */}
          {customMarker && (
            <Marker
              longitude={customMarker.lng}
              latitude={customMarker.lat}
              anchor="bottom"
            >
              <svg
                className="w-7 h-7 drop-shadow"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: "#059669" }}
              >
                <path d="M12 2c-3.86 0-7 3.14-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </Marker>
          )}

          {/* ── Popup survol signalement ── */}
          {hoveredPin && hoveredCoords && (
            <Popup
              longitude={hoveredPin.lng}
              latitude={hoveredPin.lat}
              closeOnClick={false}
              closeButton={false}
              offset={[0, -22]}
              anchor="bottom"
              maxWidth="340px"
            >
              <div className="text-gray-800 text-sm leading-relaxed min-w-[260px] py-1">
                {/* Titre */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">{hoveredPin.title}</h3>
                  <span
                    className="shrink-0 w-2.5 h-2.5 rounded-full mt-1"
                    style={{ backgroundColor: getRiskColorHex(hoveredPin.priority) }}
                    title={`Priorité: ${hoveredPin.priority}`}
                  />
                </div>

                {/* Catégorie */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: getCategoryColor(hoveredPin.category) }}
                  />
                  <span className="font-semibold text-gray-600 text-sm">
                    {hoveredPin.category}
                  </span>
                </div>

                {/* Détails */}
                {hoveredPin.details && (
                  <p className="text-gray-600 mb-1.5 leading-relaxed">{hoveredPin.details}</p>
                )}

                {/* Date */}
                {hoveredPin.date && (
                  <div className="flex items-center gap-1.5 text-gray-500 font-medium mb-1.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(hoveredPin.date))}</span>
                  </div>
                )}

                {/* Localisation détaillée */}
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Localisation</span>
                  </div>
                  <div className="pl-4.5 border-l-2 border-gray-100 ml-1.5 flex flex-col gap-0.5 mt-0.5">
                    {hoveredPin.regionName && <div className="text-xs"><span className="text-gray-400">Région:</span> <span className="text-gray-700">{hoveredPin.regionName}</span></div>}
                    {hoveredPin.municipalityName && <div className="text-xs"><span className="text-gray-400">Commune:</span> <span className="text-gray-700">{hoveredPin.municipalityName}</span></div>}
                    {hoveredPin.districtName && <div className="text-xs"><span className="text-gray-400">Arrond:</span> <span className="text-gray-700">{hoveredPin.districtName}</span></div>}
                    {hoveredPin.neighborhoodName && <div className="text-xs"><span className="text-gray-400">Quartier:</span> <span className="text-gray-700">{hoveredPin.neighborhoodName}</span></div>}
                    {!hoveredPin.regionName && hoveredPin.district && <div className="text-xs text-gray-600">{hoveredPin.district}</div>}
                  </div>
                </div>

                {/* Rapporteur + Rôle */}
                {hoveredPin.reporter && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-gray-700">{hoveredPin.reporter}</span>
                    {hoveredPin.reporterRole && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 leading-none">
                        {hoveredPin.reporterRole}
                      </span>
                    )}
                  </div>
                )}


                {/* Coordonnées */}
                <div className="mt-1.5 pt-1.5 border-t border-gray-100 text-sm text-gray-400 font-mono">
                  {hoveredPin.lat.toFixed(5)}, {hoveredPin.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          )}

          {/* Point live de l'utilisateur */}
          {liveLocation && (
            <Marker longitude={liveLocation[1]} latitude={liveLocation[0]} anchor="center">
              <LiveLocationIcon />
            </Marker>
          )}
        </Map>
        </div>
      </div>
    </div>
  )
}

export default UnifiedMap
