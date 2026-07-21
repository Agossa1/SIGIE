export type TerritoryGeoJsonLevel = 'regions' | 'municipalities' | 'districts' | 'neighborhoods'

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

export interface GeoJsonFeature {
  type: 'Feature'
  id?: string
  geometry: GeoJSON.Geometry | null
  properties: Record<string, unknown>
}

export interface TerritoryRegion {
  id: string
  code: string | null
  name: string
}

export interface TerritoryMunicipality {
  id: string
  name: string
  code?: string | null
  regionId?: string | null
  department?: string | null
  districts?: TerritoryDistrict[]
}

export interface TerritoryDistrict {
  id: string
  name: string
  code?: string | null
  municipalityId?: string
  neighborhoods?: TerritoryNeighborhood[]
}

export interface TerritoryNeighborhood {
  id: string
  name: string
  code?: string | null
  districtId?: string
}

/** Arbre complet renvoyé par GET /territory/hierarchy */
export interface TerritoryRegionNode {
  id: string
  name: string
  code?: string | null
  municipalities: TerritoryMunicipality[]
}

export interface TerritoryFormValues {
  regionId: string
  municipalityId: string
  districtId: string
  neighborhoodId: string
}

export interface TerritoryFormLabels {
  regionName: string
  municipalityName: string
  districtName: string
  neighborhoodName: string
}
