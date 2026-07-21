import type { RoleTier } from "../../../pages/shared/roleCatalog";
import type { RolePageId } from "../../../pages/shared/rolePages.config";

export interface RoleRecord {
    id: string;
    code: string;
    name: string;
    description: string;
    tier: RoleTier;
    route_prefix: string;
    dashboard_path: string;
    page_ids: RolePageId[];
    can_manage_users: boolean;
    can_manage_roles: boolean;
}