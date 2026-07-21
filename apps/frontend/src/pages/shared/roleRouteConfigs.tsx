import type { ReactElement } from "react";
import { User_Role } from "../../feature/auth/services/auth.types";
import { ROLE_FOLDER_CONFIGS, ROLE_PAGE_DEFINITIONS } from "./rolePages.config";
import type { RolePageId } from "./rolePages.config";

import SharedTeamsGpsPage from "./territorial/pages/SharedTeamsGpsPage";
import SharedSanitationPage from "./territorial/pages/SharedSanitationPage";
import SharedRoadsPage from "./territorial/pages/SharedRoadsPage";
import SharedInterventionsPage from "./territorial/pages/SharedInterventionsPage";
import SharedInfrastructurePage from "./territorial/pages/SharedInfrastructurePage";
import SharedGisMapPage from "./territorial/pages/SharedGisMapPage";
import SharedAlertsPage from "./territorial/pages/SharedAlertsPage";
import AdminPlatformLayout from "../shared/AdminPlatformLayout";
import RoleTerritorialPageShell from "./territorial/RoleTerritorialPageShell";
import SignalementsMapPage from "../Reports/SignalementsMapPage";
import RoleTerritorialDashboard from "./territorial/RoleTerritorialDashboard";
import SharedFieldOpsPage from "./territorial/pages/SharedFieldOpsPage";
import { FieldOpsDashboard } from "./territorial/pages/FieldOpsDashboard";

// Admin pages
import PlatformDashboardPage from "../adminPages/DashboardPage";
import PlatformUsersPage from "../adminPages/UsersPage";
import PlatformOrganizationsPage from "../adminPages/OrganizationsPage";
import PlatformRolesPage from "../adminPages/RolesPage";
import PlatformAccessPage from "../adminPages/AccessPage";
import PlatformAuditLogPage from "../adminPages/AuditLogPage";
import PlatformLayersPage from "../adminPages/LayersPage";

// Custom Dashboard pages
import MayorDashboardPage from "../mayor/DashboardPage";
import TechnicienDashboardPage from "../techniciens/DashboardPage";

export type RoleRouteConfig = {
  path: string;
  roles: User_Role[];
  element: ReactElement;
};

const renderGenericPage = (pageId: RolePageId, folder: string): ReactElement | null => {
  switch (pageId) {
    case "dashboard":
      return <RoleTerritorialDashboard config={ROLE_FOLDER_CONFIGS.find(c => c.folder === folder)!} />;
    case "fieldOps":
      return <SharedFieldOpsPage folder={folder} />;
    case "agentReports":
      return <RoleTerritorialPageShell folder={folder} pageId="agentReports"><SignalementsMapPage embedded /></RoleTerritorialPageShell>;
    case "interventions":
      return <SharedInterventionsPage folder={folder} />;
    case "teamsGps":
      return <SharedTeamsGpsPage folder={folder} />;
    case "gisMap":
      return <SharedGisMapPage folder={folder} />;
    case "infrastructure":
      return <SharedInfrastructurePage folder={folder} />;
    case "roads":
      return <SharedRoadsPage folder={folder} />;
    case "sanitation":
      return <SharedSanitationPage folder={folder} />;
    case "alerts":
      return <SharedAlertsPage folder={folder} />;
    default:
      return null;
  }
};

const routes: RoleRouteConfig[] = [];

ROLE_FOLDER_CONFIGS.forEach((config) => {
  config.pages.forEach((pageId) => {
    const meta = ROLE_PAGE_DEFINITIONS[pageId];
    const path = `/${config.routePrefix}/${meta.routeSuffix}`;

    // Handle adminPages overrides
    if (config.folder === "adminPages") {
      let element: ReactElement | null = null;
      switch (pageId) {
        case "dashboard": element = <PlatformDashboardPage />; break;
        case "fieldOps": element = <AdminPlatformLayout title="Missions et Planification" subtitle="Gérez le déploiement des équipes sur le terrain"><FieldOpsDashboard /></AdminPlatformLayout>; break;
        case "agentReports": element = <AdminPlatformLayout title="Signalements Agents" subtitle="Visualisez et gérez les signalements remontés par les équipes sur le terrain"><SignalementsMapPage embedded /></AdminPlatformLayout>; break;
        case "interventions": element = <SharedInterventionsPage folder="adminPages" />; break;
        case "teamsGps": element = <SharedTeamsGpsPage folder="adminPages" />; break;
        case "gisMap": element = <SharedGisMapPage folder="adminPages" />; break;
        case "infrastructure": element = <SharedInfrastructurePage folder="adminPages" />; break;
        case "roads": element = <SharedRoadsPage folder="adminPages" />; break;
        case "sanitation": element = <SharedSanitationPage folder="adminPages" />; break;
        case "alerts": element = <SharedAlertsPage folder="adminPages" />; break;
        case "users": element = <PlatformUsersPage />; break;
        case "organizations": element = <PlatformOrganizationsPage />; break;
        case "roles": element = <PlatformRolesPage />; break;
        case "access": element = <PlatformAccessPage />; break;
        case "auditLog": element = <PlatformAuditLogPage />; break;
        case "layers": element = <PlatformLayersPage />; break;
      }
      if (element) {
        routes.push({ path, roles: config.roles, element });
      }
      return;
    }

    // Handle custom dashboard overrides
    if (pageId === "dashboard") {
      if (config.folder === "mayor") {
        routes.push({ path, roles: config.roles, element: <MayorDashboardPage /> });
        return;
      }
      if (config.folder === "techniciens") {
        routes.push({ path, roles: config.roles, element: <TechnicienDashboardPage /> });
        return;
      }
    }

    // Default rendering
    const element = renderGenericPage(pageId, config.folder);
    if (element) {
      routes.push({ path, roles: config.roles, element });
    }
  });
});

export const ROLE_ROUTE_CONFIGS = routes;
