ALTER TABLE roles
    ADD COLUMN IF NOT EXISTS tier VARCHAR(50),
    ADD COLUMN IF NOT EXISTS route_prefix VARCHAR(100),
    ADD COLUMN IF NOT EXISTS dashboard_path VARCHAR(255),
    ADD COLUMN IF NOT EXISTS page_ids TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS can_manage_users BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS can_manage_roles BOOLEAN DEFAULT FALSE;

UPDATE roles SET 
    tier = 'platform', route_prefix = 'platform', dashboard_path = '/admin', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts","users","organizations","roles","access","auditLog"}', can_manage_users = TRUE, can_manage_roles = TRUE 
WHERE code = 'super_admin';

UPDATE roles SET 
    tier = 'platform', route_prefix = 'platform', dashboard_path = '/admin', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts","users","organizations","roles","access","auditLog"}', can_manage_users = TRUE, can_manage_roles = TRUE 
WHERE code = 'platform_admin';

UPDATE roles SET 
    tier = 'territorial', route_prefix = 'ministry', dashboard_path = '/ministry/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'ministry';

UPDATE roles SET 
    tier = 'territorial', route_prefix = 'prefecture', dashboard_path = '/prefecture/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'prefecture_director';

UPDATE roles SET 
    tier = 'territorial', route_prefix = 'mayor', dashboard_path = '/mayor/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'mayor';

UPDATE roles SET 
    tier = 'territorial', route_prefix = 'dst', dashboard_path = '/dst/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'dst_manager';

UPDATE roles SET 
    tier = 'territorial', route_prefix = 'sgds', dashboard_path = '/sgds/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'sgds_manager';

UPDATE roles SET 
    tier = 'field', route_prefix = 'supervisor', dashboard_path = '/supervisor/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'supervisor';

UPDATE roles SET 
    tier = 'field', route_prefix = 'team-leader', dashboard_path = '/team-leader/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'team_leader';

UPDATE roles SET 
    tier = 'field', route_prefix = 'technicien', dashboard_path = '/technicien/dashboard', page_ids = '{"dashboard","fieldOps","agentReports","interventions","gisMap"}', can_manage_users = FALSE, can_manage_roles = FALSE 
WHERE code = 'technician';

