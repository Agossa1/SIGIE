import { User_Role } from "../../feature/auth/services/auth.types"
import {
  ADMIN_TERRITORIAL_ROLES,
  FIELD_AGENT_ROLES,
  ROLE_FOLDER_CONFIGS,
  ROLE_PAGE_DEFINITIONS,
  type RolePageId,
} from "./rolePages.config"

export type RoleTier = "platform" | "territorial" | "field"

export interface RoleCatalogEntry {
  role: User_Role
  label: string
  description: string
  tier: RoleTier
  routePrefix: string
  dashboardPath: string
  pageIds: RolePageId[]
  canManageUsers: boolean
  canManageRoles: boolean
}

const tierByRole: Record<User_Role, RoleTier> = {
  [User_Role.SUPER_ADMIN]: "platform",
  [User_Role.PLATFORM_ADMIN]: "platform",
  [User_Role.MINISTRY]: "territorial",
  [User_Role.PREFECTURE_DIRECTOR]: "territorial",
  [User_Role.MAYOR]: "territorial",
  [User_Role.DST_MANAGER]: "territorial",
  [User_Role.SGDS_MANAGER]: "territorial",
  [User_Role.SUPERVISOR]: "field",
  [User_Role.TEAM_LEADER]: "field",
  [User_Role.TECHNICIAN]: "field",
  [User_Role.VIEWER]: "field",
}

const labels: Record<User_Role, string> = {
  [User_Role.SUPER_ADMIN]: "Super administrateur",
  [User_Role.PLATFORM_ADMIN]: "Administrateur plateforme",
  [User_Role.MINISTRY]: "Ministère du Cadre de Vie",
  [User_Role.PREFECTURE_DIRECTOR]: "Directeur préfectoral",
  [User_Role.MAYOR]: "Maire / municipalité",
  [User_Role.DST_MANAGER]: "Responsable DST",
  [User_Role.SGDS_MANAGER]: "Responsable SGDS",
  [User_Role.SUPERVISOR]: "Superviseur de zone",
  [User_Role.TEAM_LEADER]: "Chef de brigade",
  [User_Role.TECHNICIAN]: "Technicien terrain",
  [User_Role.VIEWER]: "Observateur (lecture seule)",
}

const descriptions: Record<User_Role, string> = {
  [User_Role.SUPER_ADMIN]:
    "Accès complet à la plateforme, gestion des rôles, utilisateurs et paramètres sensibles.",
  [User_Role.PLATFORM_ADMIN]:
    "Administration opérationnelle de la plateforme HSE TERRA (utilisateurs, organisations, audit).",
  [User_Role.MINISTRY]:
    "Vue nationale : supervision, cartographie, ouvrages, salubrité et alertes à l'échelle du pays.",
  [User_Role.PREFECTURE_DIRECTOR]:
    "Pilotage départemental : signalements, interventions et suivi territorial préfectoral.",
  [User_Role.MAYOR]:
    "Gestion communale : indicateurs locaux, ouvrages, voirie et salubrité de la municipalité.",
  [User_Role.DST_MANAGER]:
    "Services techniques : ouvrages hydrauliques, routes et chantiers du périmètre DST.",
  [User_Role.SGDS_MANAGER]:
    "Direction SGDS : collectes, insalubrité et alertes liées à l'assainissement.",
  [User_Role.SUPERVISOR]:
    "Coordination de zone : missions terrain, équipes GPS et signalements supervisés.",
  [User_Role.TEAM_LEADER]:
    "Encadrement de brigade : opérations terrain, interventions et suivi d'équipe.",
  [User_Role.TECHNICIAN]:
    "Agent terrain : saisie de signalements, interventions assignées et missions quotidiennes.",
  [User_Role.VIEWER]:
    "Consultation seule : visualisation des cartes, indicateurs et signalements sans modification.",
}

function buildDashboardPath(routePrefix: string, role: User_Role): string {
  if (role === User_Role.SUPER_ADMIN || role === User_Role.PLATFORM_ADMIN) {
    return "/admin"
  }
  return `/${routePrefix}/${ROLE_PAGE_DEFINITIONS.dashboard.routeSuffix}`
}

export const ROLE_CATALOG: RoleCatalogEntry[] = Object.values(User_Role).map(role => {
  const folder = ROLE_FOLDER_CONFIGS.find(c => c.roles.includes(role))
  const routePrefix = folder?.routePrefix ?? "—"
  return {
    role,
    label: labels[role],
    description: descriptions[role],
    tier: tierByRole[role],
    routePrefix,
    dashboardPath: folder ? buildDashboardPath(routePrefix, role) : "/login",
    pageIds: folder?.pages ?? [],
    canManageUsers: role === User_Role.SUPER_ADMIN || role === User_Role.PLATFORM_ADMIN,
    canManageRoles: role === User_Role.SUPER_ADMIN || role === User_Role.PLATFORM_ADMIN,
  }
})

export const ROLE_TIER_LABELS: Record<RoleTier, string> = {
  platform: "Plateforme",
  territorial: "Territorial",
  field: "Terrain",
}

export const ADMIN_MANAGEABLE_ROLES = [User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN]

export const TERRITORIAL_ROLE_SET = ADMIN_TERRITORIAL_ROLES.filter(
  r => r !== User_Role.SUPER_ADMIN && r !== User_Role.PLATFORM_ADMIN
)

export const FIELD_ROLE_SET = FIELD_AGENT_ROLES

export function getRoleLabel(role: User_Role): string {
  return labels[role] ?? role
}

export function getPageLabel(pageId: RolePageId): string {
  return ROLE_PAGE_DEFINITIONS[pageId]?.title ?? pageId
}
