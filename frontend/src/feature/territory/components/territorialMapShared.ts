import type { TerritoryGeoJsonLevel } from '../services/territory.types'

export type TerritoryLayerKey = TerritoryGeoJsonLevel

export interface TerritoryLayerConfig {
  key: TerritoryLayerKey
  label: string
  minZoom: number
  style: { color: string; weight: number; opacity: number; fillColor: string; fillOpacity: number }
  activeClass: string
  dotClass: string
}

export const DETAIL_LAYERS_MIN_ZOOM = 0

export const TERRITORY_LAYER_CONFIG: TerritoryLayerConfig[] = [
  {
    key: 'regions',
    label: 'Régions',
    minZoom: 0,
    style: { color: '#64748b', weight: 2, opacity: 0.9, fillColor: '#94a3b8', fillOpacity: 0.12 },
    activeClass: 'border-slate-200 text-slate-700 bg-slate-50/60',
    dotClass: 'bg-slate-400',
  },
  {
    key: 'municipalities',
    label: 'Communes',
    minZoom: 0,
    style: { color: '#2563eb', weight: 1.5, opacity: 0.85, fillColor: '#3b82f6', fillOpacity: 0.1 },
    activeClass: 'border-blue-200 text-blue-700 bg-blue-50/50',
    dotClass: 'bg-blue-500',
  },
  {
    key: 'districts',
    label: 'Arrondissements',
    minZoom: 0,
    style: { color: '#059669', weight: 1.2, opacity: 0.75, fillColor: '#10b981', fillOpacity: 0.06 },
    activeClass: 'border-emerald-200 text-emerald-700 bg-emerald-50/50',
    dotClass: 'bg-emerald-500',
  },
  {
    key: 'neighborhoods',
    label: 'Quartiers',
    minZoom: 0,
    style: { color: '#d97706', weight: 1, opacity: 0.7, fillColor: '#f59e0b', fillOpacity: 0.08 },
    activeClass: 'border-amber-200 text-amber-700 bg-amber-50/50',
    dotClass: 'bg-amber-500',
  },
]

export const EMPTY_GEOMETRY_NOTICE =
  'Certaines géométries (arrondissements ou quartiers) ne sont pas encore renseignées en base. Le contour communal (ligne bleue pointillée) reste affiché lorsqu’il est disponible.'
