import { User_Role } from '../../auth/services/auth.types'
import {
  COMMUNE_SCOPED_ROLES,
  NATIONAL_ROLES,
  REGION_SCOPED_ROLES,
} from '../../admin/utils/roleTerritoryRules'
import type { TerritoryGeoJsonLevel } from './territory.types'

export type TerritorialMapPreset =
  | 'admin-national'
  | 'commune-field'
  | 'region-prefecture'
  | 'national-territorial'

const PRESET_LAYERS: Record<TerritorialMapPreset, TerritoryGeoJsonLevel[]> = {
  /** Vue nationale plateforme — toutes les couches. */
  'admin-national': ['regions', 'municipalities', 'districts', 'neighborhoods'],
  /** Maire, technicien, superviseur, chef de brigade, DST/SGDS communal. */
  'commune-field': ['municipalities', 'districts', 'neighborhoods'],
  /** Directeur préfectoral — département / région. */
  'region-prefecture': ['regions', 'districts', 'neighborhoods'],
  /** Ministère, préfecture sans id — régions + communes. */
  'national-territorial': ['regions', 'municipalities'],
}

export function layersForPreset(preset: TerritorialMapPreset): TerritoryGeoJsonLevel[] {
  return [...PRESET_LAYERS[preset]]
}

/** Preset carte par rôle principal (premier rôle métier hors admin). */
export function presetForRoles(roles: User_Role[]): TerritorialMapPreset {
  if (roles.some((r) => NATIONAL_ROLES.includes(r))) {
    return roles.includes(User_Role.MINISTRY) ? 'national-territorial' : 'admin-national'
  }
  if (roles.some((r) => REGION_SCOPED_ROLES.includes(r))) {
    return 'region-prefecture'
  }
  if (roles.some((r) => COMMUNE_SCOPED_ROLES.includes(r))) {
    return 'commune-field'
  }
  return 'admin-national'
}

export function presetForFolder(folder: string): TerritorialMapPreset {
  switch (folder) {
    case 'mayor':
    case 'techniciens':
    case 'supervisor':
    case 'teamLeader':
    case 'dst':
    case 'sgds':
      return 'commune-field'
    case 'prefecture':
      return 'region-prefecture'
    case 'ministry':
      return 'national-territorial'
    default:
      return 'admin-national'
  }
}
