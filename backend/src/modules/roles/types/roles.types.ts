export interface RoleRecord {
    id: string;
    code: string;
    name: string;
    description: string;
    tier: string;
    route_prefix: string;
    dashboard_path: string;
    page_ids: string[];
    can_manage_users: boolean;
    can_manage_roles: boolean;
    created_at: Date;
}
