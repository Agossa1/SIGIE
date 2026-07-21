-- ============================================================
-- Migration 01 : Indexes de performance
-- Ajoute des indexes sur les colonnes fréquemment filtrées
-- pour optimiser les requêtes les plus courantes.
-- ============================================================

-- Technician Reports : filtres les plus utilisés
CREATE INDEX IF NOT EXISTS idx_reports_status ON technician_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_municipality ON technician_reports(municipality_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON technician_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_category ON technician_reports(issue_category);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON technician_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON technician_reports(created_at DESC);

-- Missions : filtres et jointures
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_assigned_team ON missions(assigned_team_id);
CREATE INDEX IF NOT EXISTS idx_missions_municipality ON missions(municipality_id);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);

-- Interventions : filtres et jointures
CREATE INDEX IF NOT EXISTS idx_interventions_mission ON interventions(mission_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_created_at ON interventions(created_at DESC);

-- Team members : jointure fréquente
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Mission assignments
CREATE INDEX IF NOT EXISTS idx_mission_assignments_mission ON mission_assignments(mission_id);

-- Mission reports
CREATE INDEX IF NOT EXISTS idx_mission_reports_mission ON mission_reports(mission_id);

-- Mission status logs
CREATE INDEX IF NOT EXISTS idx_mission_status_logs_mission ON mission_status_logs(mission_id);

-- Report comments
CREATE INDEX IF NOT EXISTS idx_report_comments_report ON report_comments(report_id);

-- GIS features
CREATE INDEX IF NOT EXISTS idx_gis_features_layer ON gis_features(layer_id);

-- Users : recherche par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Spatiaux (PostGIS) — pour les requêtes géographiques futures
CREATE INDEX IF NOT EXISTS idx_reports_location ON technician_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_missions_location ON missions USING GIST (location);
-- NOTE: idx_interventions_location omis — la table interventions n'a pas de colonne location