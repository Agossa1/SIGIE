import { User_Role } from "../../auth/services/auth.types"

/** Comptes rattachés à une commune (maire, technicien, superviseur, etc.). */
export const COMMUNE_SCOPED_ROLES: User_Role[] = [
  User_Role.MAYOR,
  User_Role.TECHNICIAN,
  User_Role.SUPERVISOR,
  User_Role.TEAM_LEADER,
  User_Role.DST_MANAGER,
  User_Role.SGDS_MANAGER,
]

/** Directeur départemental / préfectoral — périmètre région. */
export const REGION_SCOPED_ROLES: User_Role[] = [User_Role.PREFECTURE_DIRECTOR]

/** Ministère et admins plateforme — pas de rattachement obligatoire. */
export const NATIONAL_ROLES: User_Role[] = [
  User_Role.MINISTRY,
  User_Role.SUPER_ADMIN,
  User_Role.PLATFORM_ADMIN,
]

export function needsCommuneAttachment(role?: User_Role): boolean {
  return role != null && COMMUNE_SCOPED_ROLES.includes(role)
}

export function needsRegionAttachment(role?: User_Role): boolean {
  return role != null && REGION_SCOPED_ROLES.includes(role)
}

export function needsTerritoryAttachment(role?: User_Role): boolean {
  return needsCommuneAttachment(role) || needsRegionAttachment(role)
}
