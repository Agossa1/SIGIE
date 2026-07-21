import { User_Role } from "../../feature/auth/services/auth.types"

export type RolePageId =
  | "dashboard"
  | "fieldOps"
  | "agentReports"
  | "interventions"
  | "teamsGps"
  | "gisMap"
  | "infrastructure"
  | "roads"
  | "sanitation"
  | "alerts"
  | "users"
  | "organizations"
  | "roles"
  | "access"
  | "auditLog"
  | "layers"

export interface RolePageMeta {
  id: RolePageId
  fileName: string
  componentName: string
  routeSuffix: string
  title: string
  subtitle: string
}

export const ROLE_PAGE_DEFINITIONS: Record<RolePageId, Omit<RolePageMeta, "id">> = {
  dashboard: {
    fileName: "DashboardPage",
    componentName: "DashboardPage",
    routeSuffix: "dashboard",
    title: "Tableau de bord",
    subtitle: "Indicateurs et vue d'ensemble de votre périmètre.",
  },
  fieldOps: {
    fileName: "FieldOpsPage",
    componentName: "FieldOpsPage",
    routeSuffix: "operations-terrain",
    title: "Opérations terrain",
    subtitle: "Suivi des missions et activités sur le terrain.",
  },
  agentReports: {
    fileName: "AgentReportsPage",
    componentName: "AgentReportsPage",
    routeSuffix: "signalements",
    title: "Signalements agents",
    subtitle: "Consultation des signalements remontés par les équipes.",
  },
  interventions: {
    fileName: "InterventionsPage",
    componentName: "InterventionsPage",
    routeSuffix: "interventions",
    title: "Interventions",
    subtitle: "Planification et suivi des interventions programmées.",
  },
  teamsGps: {
    fileName: "TeamsGpsPage",
    componentName: "TeamsGpsPage",
    routeSuffix: "equipes-gps",
    title: "Équipes & suivi GPS",
    subtitle: "Localisation et coordination des brigades terrain.",
  },
  gisMap: {
    fileName: "GisMapPage",
    componentName: "GisMapPage",
    routeSuffix: "cartographie",
    title: "Cartographie SIG",
    subtitle: "Couches géographiques et données territoriales.",
  },
  infrastructure: {
    fileName: "InfrastructurePage",
    componentName: "InfrastructurePage",
    routeSuffix: "ouvrages",
    title: "Ouvrages & canaux",
    subtitle: "Inventaire et état des ouvrages hydrauliques.",
  },
  roads: {
    fileName: "RoadsPage",
    componentName: "RoadsPage",
    routeSuffix: "routes",
    title: "Réseau routier",
    subtitle: "État du réseau et points critiques (nids-de-poule).",
  },
  sanitation: {
    fileName: "SanitationPage",
    componentName: "SanitationPage",
    routeSuffix: "salubrite",
    title: "Collectes & insalubrité",
    subtitle: "Suivi des collectes et zones insalubres.",
  },
  alerts: {
    fileName: "AlertsPage",
    componentName: "AlertsPage",
    routeSuffix: "alertes",
    title: "Alertes & crues",
    subtitle: "Alertes météo, hydrologiques et risques climatiques.",
  },
  users: {
    fileName: "UsersPage",
    componentName: "UsersPage",
    routeSuffix: "utilisateurs",
    title: "Utilisateurs",
    subtitle: "Gestion des comptes et accréditations officielles.",
  },
  organizations: {
    fileName: "OrganizationsPage",
    componentName: "OrganizationsPage",
    routeSuffix: "organisations",
    title: "Organisations & communes",
    subtitle: "Structures territoriales et rattachements institutionnels.",
  },
  roles: {
    fileName: "RolesPage",
    componentName: "RolesPage",
    routeSuffix: "roles",
    title: "Rôles",
    subtitle: "Référentiel des rôles institutionnels et périmètres d'accès.",
  },
  access: {
    fileName: "AccessPage",
    componentName: "AccessPage",
    routeSuffix: "acces",
    title: "Accès & permissions",
    subtitle: "Attribution des rôles et contrôle des accès utilisateurs.",
  },
  auditLog: {
    fileName: "AuditLogPage",
    componentName: "AuditLogPage",
    routeSuffix: "audit",
    title: "Journaux d'audit",
    subtitle: "Traçabilité des actions sensibles sur la plateforme.",
  },
  layers: {
    fileName: "LayersPage",
    componentName: "LayersPage",
    routeSuffix: "couches",
    title: "Couches SIG",
    subtitle: "Importation et gestion des couches géospatiales (GeoJSON / Shapefile).",
  },
}

export interface RoleFolderConfig {
  folder: string
  routePrefix: string
  label: string
  roles: User_Role[]
  pages: RolePageId[]
  dashboardTitle?: string
}

export const ROLE_FOLDER_CONFIGS: RoleFolderConfig[] = [
  {
    folder: "adminPages",
    routePrefix: "platform",
    label: "Administration plateforme",
    roles: [User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN],
    pages: [
      "dashboard",
      "fieldOps",
      "agentReports",
      "interventions",
      "teamsGps",
      "gisMap",
      "infrastructure",
      "roads",
      "sanitation",
      "alerts",
      "users",
      "organizations",
      "roles",
      "access",
      "auditLog",
      "layers",
    ],
    dashboardTitle: "Vue d'ensemble — Plateforme",
  },
  {
    folder: "ministry",
    routePrefix: "ministry",
    label: "Ministère du Cadre de Vie",
    roles: [User_Role.MINISTRY],
    pages: [
      "dashboard",
      "fieldOps",
      "agentReports",
      "interventions",
      "teamsGps",
      "gisMap",
      "infrastructure",
      "roads",
      "sanitation",
      "alerts",
    ],
    dashboardTitle: "Vue d'ensemble — Niveau national",
  },
  {
    folder: "prefecture",
    routePrefix: "prefecture",
    label: "Direction préfectorale",
    roles: [User_Role.PREFECTURE_DIRECTOR],
    pages: [
      "dashboard",
      "fieldOps",
      "agentReports",
      "interventions",
      "teamsGps",
      "gisMap",
      "infrastructure",
      "roads",
      "sanitation",
      "alerts",
    ],
    dashboardTitle: "Vue préfectorale / départementale",
  },
  {
    folder: "mayor",
    routePrefix: "mayor",
    label: "Mairie / municipalité",
    roles: [User_Role.MAYOR],
    pages: [
      "dashboard",
      "fieldOps",
      "agentReports",
      "interventions",
      "teamsGps",
      "gisMap",
      "infrastructure",
      "roads",
      "sanitation",
      "alerts",
    ],
    dashboardTitle: "Tableau de bord communal",
  },
  {
    folder: "dst",
    routePrefix: "dst",
    label: "Services techniques (DST)",
    roles: [User_Role.DST_MANAGER],
    pages: [
      "dashboard",
      "fieldOps",
      "agentReports",
      "interventions",
      "teamsGps",
      "gisMap",
      "infrastructure",
      "roads",
      "sanitation",
      "alerts",
    ],
    dashboardTitle: "Vue DST — ouvrages et chantiers",
  },
  {
    folder: "sgds",
    routePrefix: "sgds",
    label: "Direction SGDS",
    roles: [User_Role.SGDS_MANAGER],
    pages: [
      "dashboard",
      "fieldOps",
      "agentReports",
      "interventions",
      "teamsGps",
      "gisMap",
      "infrastructure",
      "roads",
      "sanitation",
      "alerts",
    ],
    dashboardTitle: "Vue SGDS — salubrité et déchets",
  },
  {
    folder: "supervisor",
    routePrefix: "supervisor",
    label: "Supervision de zone",
    roles: [User_Role.SUPERVISOR],
    pages: ["dashboard", "fieldOps", "agentReports", "interventions", "teamsGps", "gisMap"],
    dashboardTitle: "Supervision de zone",
  },
  {
    folder: "teamLeader",
    routePrefix: "team-leader",
    label: "Chef de brigade",
    roles: [User_Role.TEAM_LEADER],
    pages: ["dashboard", "fieldOps", "agentReports", "interventions", "teamsGps", "gisMap"],
    dashboardTitle: "Chef de brigade — coordination",
  },
  {
    folder: "techniciens",
    routePrefix: "technicien",
    label: "Équipe terrain",
    roles: [User_Role.TECHNICIAN],
    pages: ["dashboard", "fieldOps", "agentReports", "interventions", "gisMap"],
    dashboardTitle: "Espace technicien / agent terrain",
  },
  {
    folder: "viewer",
    routePrefix: "viewer",
    label: "Observateur",
    roles: [User_Role.VIEWER],
    pages: ["dashboard", "gisMap", "infrastructure", "roads", "sanitation", "alerts"],
    dashboardTitle: "Consultation — Lecture seule",
  },
]

export const ADMIN_TERRITORIAL_ROLES: User_Role[] = [
  User_Role.SUPER_ADMIN,
  User_Role.PLATFORM_ADMIN,
  User_Role.MINISTRY,
  User_Role.PREFECTURE_DIRECTOR,
  User_Role.MAYOR,
  User_Role.DST_MANAGER,
  User_Role.SGDS_MANAGER,
]

export const FIELD_AGENT_ROLES: User_Role[] = [
  User_Role.SUPERVISOR,
  User_Role.TEAM_LEADER,
  User_Role.TECHNICIAN,
  User_Role.VIEWER,
]

export function getRoleFolderForRoles(roles: User_Role[]): RoleFolderConfig | undefined {
  return ROLE_FOLDER_CONFIGS.find(config =>
    config.roles.some(role => roles.includes(role))
  )
}

export function getRoleFolderByFolder(folder: string): RoleFolderConfig | undefined {
  return ROLE_FOLDER_CONFIGS.find(config => config.folder === folder)
}

export function getDefaultRouteForRoles(roles: User_Role[]): string {
  return buildRolePath(roles, "dashboard")
}

export function buildRolePath(roles: User_Role[], pageId: RolePageId): string {
  if (pageId === "dashboard") {
    if (roles.includes(User_Role.SUPER_ADMIN) || roles.includes(User_Role.PLATFORM_ADMIN)) {
      return "/admin"
    }
    const folder = getRoleFolderForRoles(roles)
    if (folder) {
      return `/${folder.routePrefix}/${ROLE_PAGE_DEFINITIONS.dashboard.routeSuffix}`
    }
    return "/login"
  }

  const folder = getRoleFolderForRoles(roles)
  if (folder && folder.pages.includes(pageId)) {
    return `/${folder.routePrefix}/${ROLE_PAGE_DEFINITIONS[pageId].routeSuffix}`
  }

  if (roles.includes(User_Role.SUPER_ADMIN) || roles.includes(User_Role.PLATFORM_ADMIN)) {
    return `/platform/${ROLE_PAGE_DEFINITIONS[pageId].routeSuffix}`
  }

  return "/admin"
}
