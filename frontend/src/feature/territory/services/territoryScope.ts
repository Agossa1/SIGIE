import type { User } from '../../auth/services/auth.types'
import { User_Role } from '../../auth/services/auth.types'
import {
  COMMUNE_SCOPED_ROLES,
  NATIONAL_ROLES,
  REGION_SCOPED_ROLES,
} from '../../admin/utils/roleTerritoryRules'
import type { TerritoryGeoJsonOptions } from './territory.api'
import type { TerritoryGeoJsonLevel } from './territory.types'

export type TerritoryScopeLevel = 'national' | 'region' | 'municipality' | 'district'

export interface TerritoryScope {
  level: TerritoryScopeLevel
  regionId?: string
  municipalityId?: string
  districtId?: string
  department?: string
}

export interface TerritoryScopeInput {
  roles?: User_Role[]
  municipalityId?: string | null
  regionId?: string | null
  districtId?: string | null
  department?: string | null
}

/** Lit les identifiants territoriaux depuis l’objet utilisateur auth (camelCase ou snake_case). */
export function territoryIdsFromUser(user: User | null | undefined): {
  municipalityId?: string
  regionId?: string
  districtId?: string
  department?: string
} {
  if (!user) return {}
  return {
    municipalityId: user.municipalityId ?? user.municipalityId,
    regionId: user.regionId ?? user.regionId,
    districtId: user.districtId ?? user.districtId,
    department: user.department,
  }
}

/**
 * Périmètre effectif aligné sur le backend (territoryScope.ts).
 * Sans id territorial sur un rôle non national → périmètre national (rétrocompat).
 */
export function resolveTerritoryScope(input: TerritoryScopeInput): TerritoryScope {
  const roles = (input.roles ?? []).filter(Boolean)

  if (roles.some((r) => NATIONAL_ROLES.includes(r))) {
    return { level: 'national' }
  }

  if (input.districtId) {
    return { level: 'district', districtId: input.districtId }
  }

  const wantsCommune =
    roles.length === 0 || roles.some((r) => COMMUNE_SCOPED_ROLES.includes(r))
  if (wantsCommune && input.municipalityId) {
    return { level: 'municipality', municipalityId: input.municipalityId }
  }

  const wantsRegion = roles.some((r) => REGION_SCOPED_ROLES.includes(r))
  if (wantsRegion && input.regionId) {
    return { level: 'region', regionId: input.regionId }
  }

  if (input.regionId) {
    return { level: 'region', regionId: input.regionId }
  }

  if (input.municipalityId) {
    return { level: 'municipality', municipalityId: input.municipalityId }
  }

  if (input.department) {
    return { level: 'region', department: input.department }
  }

  return { level: 'national' }
}

/** Filtres GeoJSON à passer à GET /territory/geojson/:level selon le périmètre. */
export function geoJsonFiltersForLevel(
  scope: TerritoryScope,
  level: TerritoryGeoJsonLevel
): TerritoryGeoJsonOptions {
  switch (scope.level) {
    case 'district':
      if (level === 'districts') return { districtId: scope.districtId }
      if (level === 'neighborhoods') return { districtId: scope.districtId }
      if (level === 'municipalities' && scope.municipalityId) {
        return { municipalityId: scope.municipalityId }
      }
      return {}
    case 'municipality':
      if (level === 'municipalities' || level === 'districts' || level === 'neighborhoods') {
        return { municipalityId: scope.municipalityId }
      }
      if (level === 'regions' && scope.regionId) {
        return { regionId: scope.regionId }
      }
      return { municipalityId: scope.municipalityId }
    case 'region':
      if (level === 'regions' || level === 'municipalities') {
        return { regionId: scope.regionId }
      }
      if (level === 'districts' || level === 'neighborhoods') {
        return { regionId: scope.regionId }
      }
      return { regionId: scope.regionId }
    default:
      return {}
  }
}
