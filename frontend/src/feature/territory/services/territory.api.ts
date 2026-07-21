import { api } from "../../../lib/apiClient"
import { geoJsonFiltersForLevel, type TerritoryScope } from "./territoryScope"
import type {
  GeoJsonFeatureCollection,
  TerritoryDistrict,
  TerritoryGeoJsonLevel,
  TerritoryMunicipality,
  TerritoryNeighborhood,
  TerritoryRegion,
  TerritoryRegionNode,
} from "./territory.types"

export interface TerritoryGeoJsonOptions {
  tolerance?: number
  regionId?: string
  municipalityId?: string
  districtId?: string
}

export interface TerritoryReverseGeocode {
  regionId?: string
  regionName?: string
  municipalityId?: string
  name?: string
  municipalityName?: string
  districtId?: string
  districtName?: string
  neighborhoodId?: string
  neighborhoodName?: string
}

export const territoryApi = {
  getRegions: () => api.get<{ data: TerritoryRegion[] }>("/territory/regions"),

  getHierarchy: () => api.get<{ data: TerritoryRegionNode[] }>("/territory/hierarchy"),

  getMunicipalitiesByRegion: (regionId: string) =>
    api.get<{ data: TerritoryMunicipality[] }>(
      `/territory/municipalities?regionId=${encodeURIComponent(regionId)}`
    ),

  getMunicipalities: () =>
    api.get<{ data: TerritoryMunicipality[] }>("/territory/municipalities"),


  getDistrictsByMunicipality: (municipalityId: string) =>
    api.get<{ data: TerritoryDistrict[] }>(
      `/territory/districts?municipalityId=${encodeURIComponent(municipalityId)}`
    ),

  getNeighborhoodsByDistrict: (districtId: string) =>
    api.get<{ data: TerritoryNeighborhood[] }>(
      `/territory/neighborhoods?districtId=${encodeURIComponent(districtId)}`
    ),

  reverseGeocode: (lat: number, lng: number) =>
    api.get<{ data: TerritoryReverseGeocode | null }>(
      `/territory/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
    ),

  getGeoJson: (level: TerritoryGeoJsonLevel, options: TerritoryGeoJsonOptions = {}) => {
    const params = new URLSearchParams()
    if (options.tolerance !== undefined) params.set('tolerance', String(options.tolerance))
    if (options.regionId) params.set('regionId', options.regionId)
    if (options.municipalityId) params.set('municipalityId', options.municipalityId)
    if (options.districtId) params.set('districtId', options.districtId)
    const qs = params.toString()
    return api.get<{ data: GeoJsonFeatureCollection }>(
      `/territory/geojson/${level}${qs ? `?${qs}` : ''}`
    )
  },

  /** Régions + communes — chargement initial carte admin (zoom pays) */
  getBaseTerritoryGeoJson: async () => {
    const empty: GeoJsonFeatureCollection = { type: 'FeatureCollection', features: [] }
    const results = await Promise.allSettled([
      territoryApi.getGeoJson('regions'),
      territoryApi.getGeoJson('municipalities'),
    ])
    const pick = (r: PromiseSettledResult<{ data: GeoJsonFeatureCollection }>) =>
      r.status === 'fulfilled' ? r.value.data : empty
    return {
      regions: pick(results[0]),
      municipalities: pick(results[1]),
    }
  },

  /** Arrondissements + quartiers — chargement différé (zoom local) */
  getDetailTerritoryGeoJson: async () => {
    const empty: GeoJsonFeatureCollection = { type: 'FeatureCollection', features: [] }
    const results = await Promise.allSettled([
      territoryApi.getGeoJson('districts'),
      territoryApi.getGeoJson('neighborhoods'),
    ])
    const pick = (r: PromiseSettledResult<{ data: GeoJsonFeatureCollection }>) =>
      r.status === 'fulfilled' ? r.value.data : empty
    return {
      districts: pick(results[0]),
      neighborhoods: pick(results[1]),
    }
  },

  getAllTerritoryGeoJson: async () => {
    const [base, detail] = await Promise.all([
      territoryApi.getBaseTerritoryGeoJson(),
      territoryApi.getDetailTerritoryGeoJson(),
    ])
    return { ...base, ...detail }
  },

  /** Charge les couches demandées avec filtres issus du périmètre JWT / utilisateur. */
  fetchLayersGeoJson: async (
    layers: TerritoryGeoJsonLevel[],
    scope: TerritoryScope
  ): Promise<Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>>> => {
    const empty: GeoJsonFeatureCollection = { type: 'FeatureCollection', features: [] }
    const unique = [...new Set(layers)]
    const results = await Promise.allSettled(
      unique.map((level) =>
        territoryApi.getGeoJson(level, geoJsonFiltersForLevel(scope, level))
      )
    )
    const out: Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>> = {}
    unique.forEach((level, i) => {
      const r = results[i]
      out[level] = r.status === 'fulfilled' ? r.value.data : empty
    })
    return out
  },

  /** Couches « zoom pays » (régions + communes) selon périmètre. */
  getScopedBaseTerritoryGeoJson: async (layers: TerritoryGeoJsonLevel[], scope: TerritoryScope) => {
    const baseLevels = layers.filter((l) => l === 'regions' || l === 'municipalities')
    if (baseLevels.length === 0) return {} as Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>>
    return territoryApi.fetchLayersGeoJson(baseLevels, scope)
  },

  /** Couches « zoom local » (arrondissements + quartiers) selon périmètre. */
  getScopedDetailTerritoryGeoJson: async (layers: TerritoryGeoJsonLevel[], scope: TerritoryScope) => {
    const detailLevels = layers.filter((l) => l === 'districts' || l === 'neighborhoods')
    if (detailLevels.length === 0) return {} as Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>>
    return territoryApi.fetchLayersGeoJson(detailLevels, scope)
  },
}
