-- ============================================================================
-- HSE TERRA — SCHÉMA FINAL CONSOLIDÉ (00_final_schema.sql)
-- SMART CITY & URBAN OPERATIONS PLATFORM
-- PostgreSQL + PostGIS — Prêt pour le développement
-- 
-- Généré le 2026-07-16
-- Fusionne et corrige toutes les migrations :
--   01_schema.sql, 02_territory_refactor, 03_fix_and_complete_regions,
--   04_fix_issue_category_enum, 05_fix_team_members_constraint,
--   20240520_create_teams_schema, 20240521_create_media_table,
--   20240523_create_roles_table, 20260614_add_missing_indexes,
--   20260711_phase1_link_modules
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENUM TYPES (tous consolidés, ordre alphabétique)
-- ============================================================================

-- Statut d'approbation workflow
CREATE TYPE approval_status_enum AS ENUM (
    'pending', 'approved', 'rejected', 'cancelled'
);

-- Condition des infrastructures de drainage
CREATE TYPE drainage_condition_status_enum AS ENUM (
    'excellent', 'good', 'degraded', 'critical', 'collapsed'
);

-- Statut des équipements
CREATE TYPE equipment_status_enum AS ENUM (
    'available', 'assigned', 'maintenance', 'damaged', 'lost'
);

-- Statut d'assignation terrain
CREATE TYPE field_assignment_status_enum AS ENUM (
    'pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'
);

-- Statut d'un rapport terrain
CREATE TYPE field_report_status_enum AS ENUM (
    'draft', 'submitted', 'assigned', 'in_progress', 'resolved', 'validated', 'rejected'
);

-- Type de géométrie SIG
CREATE TYPE geometry_type_enum AS ENUM (
    'point', 'line', 'polygon', 'multipolygon', 'multiline'
);

-- Statut d'un incident
CREATE TYPE incident_status_enum AS ENUM (
    'reported', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'
);

-- Type d'incident
CREATE TYPE incident_type_enum AS ENUM (
    'flood_risk', 'blocked_drain', 'waste_accumulation', 'road_damage',
    'erosion', 'stagnant_water', 'illegal_dumping', 'collapsed_structure',
    'bridge_damage', 'street_light_failure', 'wildlife_incident',
    'deforestation', 'water_pollution', 'other'
);

-- Type d'infrastructure
CREATE TYPE infrastructure_type_enum AS ENUM (
    'road', 'drain', 'bridge', 'culvert', 'retention_basin', 'sidewalk',
    'street_light', 'canal', 'market', 'waste_site', 'public_building',
    'wetland', 'urban_forest', 'eco_corridor', 'other'
);

-- Type de mouvement de stock
CREATE TYPE inventory_movement_type_enum AS ENUM (
    'in', 'out', 'transfer', 'adjustment'
);

-- Catégorie de problème signalé
CREATE TYPE issue_category_enum AS ENUM (
    'drainage', 'waste', 'road', 'lighting', 'flooding',
    'biodiversity', 'air_quality', 'water_quality', 'other'
);

-- Statut de maintenance
CREATE TYPE maintenance_status_enum AS ENUM (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'
);

-- Type de média
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

-- Statut d'une mission
CREATE TYPE mission_status_enum AS ENUM (
    'draft', 'planned', 'assigned', 'in_progress',
    'completed', 'validated', 'cancelled'
);

-- Type de mission
CREATE TYPE mission_type_enum AS ENUM (
    'drain_cleaning', 'waste_collection', 'road_repair', 'flood_response',
    'inspection', 'emergency_response', 'sanitation', 'maintenance',
    'reforestation', 'ecological_restoration', 'biodiversity_survey'
);

-- Type de notification
CREATE TYPE notification_type_enum AS ENUM (
    'sms', 'email', 'push', 'system'
);

-- Type d'organisation
CREATE TYPE organization_type_enum AS ENUM (
    'sgds', 'dst', 'municipality', 'ministry', 'prefecture', 'private_contractor'
);

-- Niveau de priorité
CREATE TYPE priority_level_enum AS ENUM (
    'low', 'medium', 'high', 'critical', 'emergency'
);

-- Niveau de risque
CREATE TYPE risk_level_enum AS ENUM (
    'low', 'medium', 'high', 'critical'
);

-- Statut de synchronisation offline
CREATE TYPE sync_status_enum AS ENUM (
    'pending', 'synced', 'failed'
);

-- Statut d'une équipe (corrigé — ne détourne plus user_status_enum)
CREATE TYPE team_status_enum AS ENUM (
    'active', 'inactive', 'suspended', 'disbanded'
);

-- Type de compte utilisateur
CREATE TYPE type_account_enum AS ENUM (
    'user', 'admin', 'organization', 'municipality', 'district',
    'neighborhood', 'field_agent', 'technician', 'partner', 'supplier', 'citizen'
);

-- Rôle utilisateur
CREATE TYPE user_role_enum AS ENUM (
    'super_admin', 'platform_admin', 'ministry', 'prefecture_director',
    'mayor', 'dst_manager', 'sgds_manager', 'supervisor',
    'team_leader', 'technician', 'viewer'
);

-- Statut utilisateur
CREATE TYPE user_status_enum AS ENUM (
    'pending', 'active', 'suspended', 'disabled'
);

-- Statut véhicule
CREATE TYPE vehicle_status_enum AS ENUM (
    'available', 'assigned', 'maintenance', 'out_of_service'
);

-- Statut d'écoulement d'eau
CREATE TYPE water_flow_status_enum AS ENUM (
    'normal', 'reduced', 'blocked', 'overflowing'
);

-- Type de fournisseur météo
CREATE TYPE weather_provider_type_enum AS ENUM (
    'api', 'satellite', 'ground_station', 'manual'
);

-- Statut de synchronisation météo
CREATE TYPE weather_sync_status_enum AS ENUM (
    'success', 'partial', 'failed'
);

-- ============================================================================
-- ENUMS AJOUTÉS — RECOMMANDATIONS D'ÉVOLUTION PRODUIT
-- ============================================================================

-- Statut d'une alerte précoce
CREATE TYPE alert_level_enum AS ENUM (
    'vigilance', 'warning', 'danger', 'extreme'
);

-- Type d'alerte
CREATE TYPE alert_type_enum AS ENUM (
    'flood', 'storm', 'heatwave', 'drought', 'epidemic', 'fire', 'coastal_erosion', 'other'
);

-- Canal de diffusion d'alerte
CREATE TYPE broadcast_channel_enum AS ENUM (
    'sms', 'whatsapp', 'push', 'radio', 'siren', 'email', 'all'
);

-- Statut d'un projet bailleur
CREATE TYPE donor_project_status_enum AS ENUM (
    'proposed', 'approved', 'funded', 'in_progress', 'completed', 'suspended', 'cancelled'
);

-- Type de bailleur
CREATE TYPE donor_type_enum AS ENUM (
    'multilateral', 'bilateral', 'ngo', 'foundation', 'private', 'government'
);

-- Statut d'un contrat de prestation
CREATE TYPE contract_status_enum AS ENUM (
    'draft', 'active', 'completed', 'terminated', 'expired'
);

-- Statut d'un signalement citoyen
CREATE TYPE citizen_report_status_enum AS ENUM (
    'submitted', 'moderated', 'approved', 'converted', 'rejected', 'duplicate'
);

-- Statut de modération
CREATE TYPE moderation_status_enum AS ENUM (
    'pending', 'approved', 'rejected', 'flagged'
);

-- Type d'indicateur ODD
CREATE TYPE sdg_goal_enum AS ENUM (
    'sdg_6', 'sdg_11', 'sdg_13', 'sdg_15', 'sdg_3', 'sdg_9', 'sdg_17'
);

-- Statut d'un scénario climatique
CREATE TYPE climate_scenario_status_enum AS ENUM (
    'active', 'archived', 'superseded'
);

-- Statut d'un plan d'adaptation
CREATE TYPE adaptation_plan_status_enum AS ENUM (
    'draft', 'adopted', 'in_progress', 'evaluated', 'revised'
);

-- Type de notification intelligente
CREATE TYPE notification_rule_trigger_enum AS ENUM (
    'threshold', 'schedule', 'event', 'manual', 'ml_prediction'
);


-- ============================================================================
-- 1. AUTHENTIFICATION & ORGANISATIONS (Core)
--    Défini en premier car référencé par municipalities et users
-- ============================================================================

-- Organisations (SGDS, DST, Mairies, Ministères, etc.)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    organization_type organization_type_enum,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 2. TERRITOIRE (Hiérarchie administrative du Bénin)
--    Région → Municipalité → Arrondissement → Quartier
-- ============================================================================

-- Régions (les 12 départements du Bénin)
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Municipalités / Communes
CREATE TABLE municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arrondissements
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quartiers
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 3. AUTHENTIFICATION (suite — roles, users, credentials, sessions, OTPs)
-- ============================================================================

-- Rôles (avec métadonnées UI)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tier VARCHAR(50),              -- 'platform', 'territorial', 'field'
    route_prefix VARCHAR(100),     -- préfixe d'URL du dashboard
    dashboard_path VARCHAR(255),   -- chemin du dashboard
    page_ids TEXT[] DEFAULT '{}',  -- pages accessibles
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_roles BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions granulaires
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liaison Rôle ↔ Permission (N:N)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    department VARCHAR(255),       -- legacy, conservé pour compatibilité
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    type type_account_enum DEFAULT 'user',
    status user_status_enum DEFAULT 'pending',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Identifiants de connexion
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des changements de statut utilisateur (audit)
CREATE TABLE user_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    old_status user_status_enum,
    new_status user_status_enum,
    reason TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rôle attribué à un utilisateur
CREATE TABLE role_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permission directe attribuée à un utilisateur
CREATE TABLE permissions_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions utilisateur
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP (activation compte, réinitialisation mot de passe, changement email)
CREATE TABLE user_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    otp_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Préférences utilisateur
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT,
    language VARCHAR(10) DEFAULT 'fr',
    fcm_token TEXT,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs d'audit
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255),
    entity_name VARCHAR(255),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 3. ÉQUIPES & RH
-- ============================================================================

-- Équipes de terrain
CREATE TABLE field_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    team_type VARCHAR(100),
    description TEXT,
    status team_status_enum DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membres d'une équipe (unicité team_id + user_id)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES field_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(team_id, user_id)
);

-- Promotions du personnel
CREATE TABLE staff_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    new_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    promoted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transferts du personnel
CREATE TABLE staff_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_team_id UUID REFERENCES field_teams(id) ON DELETE SET NULL,
    new_team_id UUID REFERENCES field_teams(id) ON DELETE SET NULL,
    transferred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pointages / Présences
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES field_teams(id) ON DELETE SET NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 4. SIG & INFRASTRUCTURES
-- ============================================================================

-- Couches SIG
CREATE TABLE gis_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    layer_type VARCHAR(100),
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entités géographiques SIG
CREATE TABLE gis_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer_id UUID REFERENCES gis_layers(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    feature_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    severity_level risk_level_enum,
    geometry GEOMETRY(Geometry, 4326),
    properties JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones à risque
CREATE TABLE risk_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    zone_type VARCHAR(100),
    risk_level risk_level_enum,
    title VARCHAR(255),
    description TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points critiques
CREATE TABLE critical_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    point_type VARCHAR(100),
    severity_level risk_level_enum,
    title VARCHAR(255),
    description TEXT,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réseaux de drainage
CREATE TABLE drainage_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    name VARCHAR(255),
    drainage_type VARCHAR(100),
    status VARCHAR(100),
    geometry GEOMETRY(MULTILINESTRING, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones cartographiées
CREATE TABLE mapped_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    area_type VARCHAR(100),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructures
CREATE TABLE infrastructures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    infrastructure_type infrastructure_type_enum,
    name VARCHAR(255),
    condition_status drainage_condition_status_enum,
    construction_year INTEGER,
    geometry GEOMETRY(Geometry, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Structures de drainage (liées aux infrastructures)
CREATE TABLE drainage_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) ON DELETE CASCADE,
    structure_type infrastructure_type_enum NOT NULL,
    condition_status drainage_condition_status_enum DEFAULT 'good',
    obstruction_level_pct NUMERIC(5,2) CHECK (obstruction_level_pct BETWEEN 0 AND 100),
    water_flow_status water_flow_status_enum DEFAULT 'normal',
    geometry GEOMETRY(Geometry, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);


-- ============================================================================
-- 5. CAPTEURS ENVIRONNEMENTAUX (placé AVANT report_details pour FK)
-- ============================================================================

CREATE TABLE environmental_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    station_name VARCHAR(255),
    sensor_type VARCHAR(50),      -- 'air_quality', 'water_ph', 'noise', 'soil_moisture'
    model_info VARCHAR(255),
    location GEOMETRY(Point, 4326),
    active BOOLEAN DEFAULT TRUE,
    last_reading JSONB,
    last_reading_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 6. MÉTÉO & CLIMAT
-- ============================================================================

-- Sources de données météo
CREATE TABLE weather_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    provider_type weather_provider_type_enum NOT NULL,
    api_url TEXT,
    api_key_encrypted TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stations météo
CREATE TABLE weather_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES weather_sources(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    altitude_m NUMERIC(8,2),
    active BOOLEAN DEFAULT TRUE,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesures météo
CREATE TABLE weather_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID NOT NULL REFERENCES weather_stations(id) ON DELETE CASCADE,
    rainfall_mm NUMERIC(10,2),
    humidity_pct NUMERIC(5,2),
    temperature_c NUMERIC(5,2),
    wind_speed_kmh NUMERIC(6,2),
    pressure_hpa NUMERIC(8,2),
    measured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prévisions météo
CREATE TABLE weather_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    source_id UUID REFERENCES weather_sources(id) ON DELETE SET NULL,
    forecast_date DATE NOT NULL,
    rainfall_mm NUMERIC(8,2),
    temperature_c NUMERIC(5,2),
    humidity_pct NUMERIC(5,2),
    wind_speed_kmh NUMERIC(6,2),
    predicted_risk_level risk_level_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alertes météo
CREATE TABLE weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    source_id UUID REFERENCES weather_sources(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    alert_level risk_level_enum NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de synchronisation météo
CREATE TABLE weather_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES weather_sources(id) ON DELETE SET NULL,
    sync_status weather_sync_status_enum NOT NULL,
    records_imported INTEGER DEFAULT 0,
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 7. RISQUES D'INONDATION
-- ============================================================================

-- Événements d'inondation
CREATE TABLE flood_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    mapped_area_id UUID REFERENCES mapped_areas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity_level risk_level_enum NOT NULL,
    affected_population INTEGER,
    water_level_cm NUMERIC(10,2),
    estimated_damage_cost NUMERIC(14,2),
    rainfall_mm NUMERIC(10,2),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections hydrauliques
CREATE TABLE hydraulic_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    structure_id UUID NOT NULL REFERENCES drainage_structures(id) ON DELETE CASCADE,
    inspected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    obstruction_level_pct NUMERIC(5,2),
    water_flow_status water_flow_status_enum,
    structural_damage_pct NUMERIC(5,2),
    notes TEXT,
    inspected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modèles de prédiction d'inondation
CREATE TABLE flood_prediction_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    description TEXT,
    accuracy_pct NUMERIC(5,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prédictions d'inondation
CREATE TABLE flood_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapped_area_id UUID REFERENCES mapped_areas(id) ON DELETE SET NULL,
    model_id UUID REFERENCES flood_prediction_models(id) ON DELETE SET NULL,
    predicted_risk_level risk_level_enum,
    predicted_flood_probability_pct NUMERIC(5,2),
    expected_rainfall_mm NUMERIC(10,2),
    prediction_date TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 8. OPÉRATIONS TERRAIN (Rapports des techniciens)
-- ============================================================================

-- Rapport principal de technicien
CREATE TABLE technician_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Contexte territorial
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE SET NULL,
    -- Références optionnelles
    infrastructure_id UUID REFERENCES infrastructures(id) ON DELETE SET NULL,
    mapped_area_id UUID REFERENCES mapped_areas(id) ON DELETE SET NULL,
    -- Contenu
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issue_category issue_category_enum NOT NULL,
    priority priority_level_enum DEFAULT 'medium',
    risk_level risk_level_enum DEFAULT 'medium',
    status field_report_status_enum DEFAULT 'submitted',
    -- Géolocalisation
    location GEOMETRY(Point, 4326),
    -- Traçabilité
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    -- Assignation & SLA (phase 1 link modules)
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    sla_hours INT DEFAULT 48,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- 8b. EXTENSIONS DE RAPPORTS (Class Table Inheritance, 1:1)
-- ============================================================================

-- Détails drainage
CREATE TABLE report_details_drainage (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    blockage_level_pct NUMERIC(5,2) CHECK (blockage_level_pct BETWEEN 0 AND 100),
    water_level_cm NUMERIC(8,2) CHECK (water_level_cm >= 0),
    flow_status water_flow_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Détails route
CREATE TABLE report_details_road (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    damage_surface_m2 NUMERIC(8,2) CHECK (damage_surface_m2 >= 0),
    pothole_depth_cm NUMERIC(5,2) CHECK (pothole_depth_cm >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Détails déchets
CREATE TABLE report_details_waste (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    estimated_volume_m3 NUMERIC(8,2) CHECK (estimated_volume_m3 >= 0),
    waste_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Détails biodiversité
CREATE TABLE report_details_biodiversity (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    species_name VARCHAR(255),
    observation_type VARCHAR(50),
    count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Détails environnement (capteurs) — environmental_sensors défini plus haut
CREATE TABLE report_details_environment (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES environmental_sensors(id) ON DELETE SET NULL,
    measured_value NUMERIC(12,4),
    unit VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8c. MÉDIAS & FICHIERS (table polymorphique unifiée)
-- ============================================================================

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    type media_type NOT NULL DEFAULT 'image',
    -- Polymorphisme : lie à n'importe quelle entité
    related_id UUID NOT NULL,
    related_type VARCHAR(50) NOT NULL,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8d. ASSIGNATIONS & COMMENTAIRES
-- ============================================================================

-- Assignation d'un rapport à une équipe ou un utilisateur
CREATE TABLE technician_report_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES technician_reports(id) ON DELETE CASCADE,
    assigned_team_id UUID REFERENCES field_teams(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assignment_status field_assignment_status_enum DEFAULT 'pending',
    assignment_notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Commentaires sur un rapport
CREATE TABLE report_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES technician_reports(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);


-- ============================================================================
-- 9. MISSIONS & OPÉRATIONS
-- ============================================================================

-- Missions
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    -- Lien vers le signalement d'origine
    report_id UUID REFERENCES technician_reports(id) ON DELETE SET NULL,
    mission_type mission_type_enum,
    priority_level priority_level_enum,
    title VARCHAR(255),
    description TEXT,
    assigned_team_id UUID REFERENCES field_teams(id) ON DELETE SET NULL,
    status mission_status_enum DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    -- Deadlines et suivi temps (phase 1)
    due_date TIMESTAMPTZ,
    estimated_hours NUMERIC(6,2),
    actual_hours NUMERIC(6,2),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    location GEOMETRY(Point, 4326)
);

-- Checklist de mission (sous-tâches)
CREATE TABLE mission_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    done_by UUID REFERENCES users(id) ON DELETE SET NULL,
    done_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "order" INT NOT NULL DEFAULT 0
);

-- Assignations de mission aux utilisateurs
CREATE TABLE mission_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rapports de mission
CREATE TABLE mission_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    report TEXT,
    photos TEXT[],
    completion_percentage INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de changement de statut des missions
CREATE TABLE mission_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    old_status mission_status_enum,
    new_status mission_status_enum,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interventions
CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    intervention_type VARCHAR(100),
    status field_assignment_status_enum,
    -- Agent responsable (phase 1)
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle_notes TEXT,
    equipment_notes TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rapports d'intervention terrain
CREATE TABLE field_intervention_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES technician_reports(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    work_done TEXT,
    blockage_removed_pct NUMERIC(5,2),
    final_condition_score NUMERIC(5,2),
    recommendations TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 10. PROPRETÉ URBAINE
-- ============================================================================

-- Points de déchets
CREATE TABLE waste_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    waste_type VARCHAR(100),
    severity_level risk_level_enum,
    status VARCHAR(50),
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collectes de déchets
CREATE TABLE waste_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waste_point_id UUID REFERENCES waste_points(id) ON DELETE SET NULL,
    collected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    collected_quantity NUMERIC(10,2),
    collection_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campagnes de salubrité
CREATE TABLE sanitation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    title VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones insalubres
CREATE TABLE unsanitary_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    severity_level risk_level_enum,
    description TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 11. ROUTES & INCIDENTS
-- ============================================================================

-- Routes
CREATE TABLE roads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    name VARCHAR(255),
    road_type VARCHAR(100),
    condition_status drainage_condition_status_enum,
    geometry GEOMETRY(MULTILINESTRING, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nids-de-poule
CREATE TABLE potholes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    road_id UUID REFERENCES roads(id) ON DELETE SET NULL,
    severity_level risk_level_enum,
    width_cm NUMERIC(10,2),
    depth_cm NUMERIC(10,2),
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections d'infrastructures
CREATE TABLE infrastructure_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) ON DELETE SET NULL,
    inspected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    condition_status drainage_condition_status_enum,
    risk_level risk_level_enum,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opérations de maintenance
CREATE TABLE maintenance_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) ON DELETE SET NULL,
    maintenance_type VARCHAR(100),
    priority_level priority_level_enum,
    estimated_cost NUMERIC(15,2),
    scheduled_date DATE,
    completed_date DATE,
    status maintenance_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans de maintenance préventive
CREATE TABLE preventive_maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id) ON DELETE SET NULL,
    maintenance_frequency_days INTEGER,
    next_maintenance_date DATE,
    estimated_future_cost NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    incident_type incident_type_enum,
    severity_level risk_level_enum,
    title VARCHAR(255),
    description TEXT,
    status incident_status_enum DEFAULT 'reported',
    geometry GEOMETRY(Geometry, 4326),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formulaires d'inspection
CREATE TABLE inspection_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    inspected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    form_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 12. LOGISTIQUE & TRACKING
-- ============================================================================

-- Véhicules
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    registration_number VARCHAR(100),
    vehicle_type VARCHAR(100),
    status vehicle_status_enum DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking des véhicules
CREATE TABLE vehicle_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    speed NUMERIC(10,2),
    location GEOMETRY(Point, 4326),
    tracked_at TIMESTAMPTZ
);

-- Tracking des utilisateurs sur le terrain
CREATE TABLE user_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    team_id UUID REFERENCES field_teams(id) ON DELETE SET NULL,
    speed_kmh NUMERIC(6,2),
    accuracy_meters NUMERIC(6,2),
    battery_level INTEGER,
    location GEOMETRY(Point, 4326),
    tracked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Équipements de terrain
CREATE TABLE field_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    equipment_type VARCHAR(100),
    serial_number VARCHAR(255),
    status equipment_status_enum DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking des équipements
CREATE TABLE equipment_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES field_equipment(id) ON DELETE SET NULL,
    location GEOMETRY(Point, 4326),
    tracked_at TIMESTAMPTZ
);


-- ============================================================================
-- 13. COMMUNICATION & WORKFLOW
-- ============================================================================

-- Alertes
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    alert_type VARCHAR(100),
    severity_level risk_level_enum,
    title VARCHAR(255),
    message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notification_type notification_type_enum,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escalades d'incidents
CREATE TABLE incident_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    escalated_to UUID REFERENCES users(id) ON DELETE SET NULL,
    escalation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows d'approbation
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    workflow_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Étapes d'un workflow d'approbation
CREATE TABLE approval_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enregistrements d'approbation
CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE SET NULL,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_status approval_status_enum,
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Politiques SLA
CREATE TABLE sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    incident_type incident_type_enum,
    priority_level priority_level_enum,
    max_response_minutes INTEGER,
    max_resolution_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suivi SLA
CREATE TABLE sla_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    sla_policy_id UUID REFERENCES sla_policies(id) ON DELETE SET NULL,
    response_deadline TIMESTAMPTZ,
    resolution_deadline TIMESTAMPTZ,
    breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 14. INVENTAIRE & FINANCE
-- ============================================================================

-- Entrepôts
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles d'inventaire
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    minimum_threshold INTEGER DEFAULT 0,
    unit VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mouvements d'inventaire
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    movement_type inventory_movement_type_enum,
    quantity INTEGER,
    reference_type VARCHAR(100),
    reference_id UUID,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fournisseurs
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bons de commande
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    order_number VARCHAR(100) UNIQUE,
    total_amount NUMERIC(15,2),
    status VARCHAR(50),
    ordered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ordered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 15. MOBILE & SMART FEATURES
-- ============================================================================

-- Appareils mobiles enregistrés
CREATE TABLE mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_uuid VARCHAR(255) UNIQUE,
    device_name VARCHAR(255),
    platform VARCHAR(50),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de synchronisation mobile
CREATE TABLE mobile_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_identifier VARCHAR(255),
    sync_type VARCHAR(50),
    sync_status sync_status_enum,
    records_uploaded INTEGER DEFAULT 0,
    records_downloaded INTEGER DEFAULT 0,
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- File d'attente de synchronisation offline
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES mobile_devices(id) ON DELETE SET NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    operation_type VARCHAR(50),
    payload JSONB,
    sync_status sync_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formulaires de collecte terrain
CREATE TABLE field_collection_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Champs des formulaires de collecte
CREATE TABLE field_collection_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES field_collection_forms(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    field_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soumissions de formulaires terrain
CREATE TABLE field_form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES field_collection_forms(id) ON DELETE SET NULL,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    report_id UUID REFERENCES technician_reports(id) ON DELETE SET NULL,
    form_data JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 16. ANALYTICS & OPEN DATA
-- ============================================================================

-- Recommandations intelligentes
CREATE TABLE smart_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    recommendation_type VARCHAR(100),
    priority_level priority_level_enum,
    recommendation_text TEXT,
    source_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des scores de risque
CREATE TABLE risk_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_zone_id UUID REFERENCES risk_zones(id) ON DELETE SET NULL,
    previous_score NUMERIC(10,2),
    new_score NUMERIC(10,2),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indicateurs KPI
CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    metric_name VARCHAR(255),
    metric_value NUMERIC(15,2),
    metric_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rapports d'analyse stratégique
CREATE TABLE strategic_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    report_type VARCHAR(100),
    title VARCHAR(255),
    report_data JSONB,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jeux de données Open Data
CREATE TABLE open_data_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    dataset_name VARCHAR(255),
    dataset_type VARCHAR(100),
    file_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widgets de dashboard
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    widget_name VARCHAR(255),
    widget_type VARCHAR(100),
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 17. BIODIVERSITÉ & ENVIRONNEMENT
-- ============================================================================

-- Flore urbaine (patrimoine végétal)
CREATE TABLE urban_flora (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    species_name VARCHAR(255),
    common_name VARCHAR(255),
    health_status VARCHAR(50),      -- 'healthy', 'diseased', 'dead', 'under_treatment'
    health_notes TEXT,
    height_m NUMERIC(5,2),
    canopy_diameter_m NUMERIC(5,2),
    trunk_circumference_cm NUMERIC(6,2),
    location GEOMETRY(Point, 4326),
    planted_at DATE,
    last_inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones protégées et corridors écologiques
CREATE TABLE protected_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    protection_level VARCHAR(100),
    area_type VARCHAR(100),         -- 'wetland', 'urban_forest', 'eco_corridor', etc.
    description TEXT,
    regulations TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesures de qualité de l'air
CREATE TABLE air_quality_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES environmental_sensors(id) ON DELETE CASCADE,
    pm25 NUMERIC(6,2),
    pm10 NUMERIC(6,2),
    no2 NUMERIC(6,2),
    o3 NUMERIC(6,2),
    co NUMERIC(6,2),
    so2 NUMERIC(6,2),
    aqi_index INTEGER,
    measured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesures de qualité de l'eau
CREATE TABLE water_quality_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES environmental_sensors(id) ON DELETE CASCADE,
    ph NUMERIC(4,2),
    turbidity_ntu NUMERIC(6,2),
    dissolved_oxygen_mg_l NUMERIC(5,2),
    temperature_c NUMERIC(5,2),
    conductivity_us_cm NUMERIC(8,2),
    measured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Observations de biodiversité
CREATE TABLE biodiversity_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    observer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    species_name VARCHAR(255),
    common_name VARCHAR(255),
    observation_type VARCHAR(50),   -- 'fauna', 'flora', 'fungi'
    count INTEGER DEFAULT 1,
    description TEXT,
    location GEOMETRY(Point, 4326),
    media_urls TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Centres de valorisation des déchets (économie circulaire)
CREATE TABLE waste_valorization_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    center_type VARCHAR(100),       -- 'composting', 'sorting', 'recycling'
    capacity_tons_day NUMERIC(10,2),
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de valorisation des déchets
CREATE TABLE waste_valorization_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID REFERENCES waste_valorization_centers(id) ON DELETE SET NULL,
    waste_type VARCHAR(100),
    input_quantity_kg NUMERIC(12,2),
    output_product VARCHAR(100),    -- 'compost', 'plastic_pellets', etc.
    output_quantity_kg NUMERIC(12,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL
);


-- ============================================================================
-- 18. COMPLIANCE
-- ============================================================================

-- Inspections de conformité
CREATE TABLE compliance_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    inspected_entity_type VARCHAR(100),
    inspected_entity_id UUID,
    compliance_status VARCHAR(50),
    notes TEXT,
    inspected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Violations de conformité
CREATE TABLE compliance_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES compliance_inspections(id) ON DELETE SET NULL,
    violation_type VARCHAR(100),
    severity_level risk_level_enum,
    penalty_amount NUMERIC(15,2),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 19. RECOMMANDATIONS D'ÉVOLUTION — FINANCE & BUDGET (P0)
--    Suivi budgétaire municipal, coûts réels vs prévisionnels, financements bailleurs
-- ============================================================================

-- Budgets annuels par municipalité
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    fiscal_year INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,          -- 'drainage', 'waste', 'roads', 'sanitation', 'greening', 'other'
    allocated_amount NUMERIC(15,2) NOT NULL,
    spent_amount NUMERIC(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'XOF',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(municipality_id, fiscal_year, category)
);

-- Dépenses réelles liées aux missions/interventions
CREATE TABLE expenditures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    intervention_id UUID REFERENCES interventions(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    expense_type VARCHAR(100),               -- 'labor', 'material', 'equipment', 'transport', 'other'
    description TEXT,
    receipt_url TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projets financés par les bailleurs (Banque Mondiale, AFD, BAD, etc.)
CREATE TABLE donor_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_type donor_type_enum DEFAULT 'multilateral',
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    total_budget NUMERIC(15,2),
    currency VARCHAR(3) DEFAULT 'XOF',
    start_date DATE,
    end_date DATE,
    status donor_project_status_enum DEFAULT 'proposed',
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_donor_projects_updated_at BEFORE UPDATE ON donor_projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- 20. RECOMMANDATIONS D'ÉVOLUTION — CITOYEN MOBILE & SIGNALEMENT COMMUNAUTAIRE (P0)
--    Application grand public : signalement simplifié, photo, WhatsApp/Telegram
-- ============================================================================

-- Signalements citoyens (simplifiés, avec modération avant transformation en technician_reports)
CREATE TABLE citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Le citoyen peut être anonyme (juste un téléphone) ou lié à un compte
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    anonymous_phone VARCHAR(50),
    -- Contenu
    category issue_category_enum NOT NULL,
    description TEXT,
    -- Géolocalisation obligatoire
    location GEOMETRY(Point, 4326) NOT NULL,
    -- Média (photo quasi-obligatoire pour un signalement citoyen)
    photo_url TEXT,
    thumbnail_url TEXT,
    -- Source du signalement
    source_channel VARCHAR(50) DEFAULT 'mobile_app',  -- 'mobile_app', 'whatsapp', 'telegram', 'web', 'ussd'
    external_ref VARCHAR(255),                        -- ID du message WhatsApp/Telegram source
    -- Modération
    status citizen_report_status_enum DEFAULT 'submitted',
    moderation_status moderation_status_enum DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    moderation_notes TEXT,
    -- Si approuvé, transformation en rapport technique
    converted_to_report_id UUID REFERENCES technician_reports(id) ON DELETE SET NULL,
    -- Feedback au citoyen
    feedback_sent BOOLEAN DEFAULT FALSE,
    feedback_sent_at TIMESTAMPTZ,
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_citizen_reports_updated_at BEFORE UPDATE ON citizen_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Chatbot conversations (WhatsApp/Telegram sessions)
CREATE TABLE chatbot_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL,           -- 'whatsapp', 'telegram'
    external_user_id VARCHAR(255) NOT NULL,  -- ID WhatsApp/Telegram de l'utilisateur
    phone_number VARCHAR(50),
    session_state VARCHAR(100) DEFAULT 'start',  -- état de la conversation
    context_data JSONB,                       -- données contextuelles accumulées
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_chatbot_sessions_updated_at BEFORE UPDATE ON chatbot_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- 21. RECOMMANDATIONS D'ÉVOLUTION — SYSTÈME D'ALERTE PRÉCOCE & RÉSILIENCE CLIMATIQUE (P0)
--    Alertes multicanal, scénarios climatiques, plans d'adaptation
-- ============================================================================

-- Système d'alerte précoce multicanale
CREATE TABLE early_warning_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    alert_type alert_type_enum NOT NULL,
    alert_level alert_level_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,                        -- consignes de sécurité pour la population
    -- Données déclencheuses
    trigger_source VARCHAR(100),              -- 'weather_forecast', 'flood_prediction', 'sensor', 'manual'
    trigger_data JSONB,                       -- données ayant déclenché l'alerte (seuil pluie, niveau eau, etc.)
    -- Diffusion
    broadcast_channels broadcast_channel_enum[] DEFAULT '{sms, push}',
    broadcast_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'sending', 'sent', 'partial', 'failed'
    recipients_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    -- Période de validité
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    -- Traçabilité
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_early_warning_alerts_updated_at BEFORE UPDATE ON early_warning_alerts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Logs de diffusion des alertes (traçabilité par canal et destinataire)
CREATE TABLE alert_broadcast_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES early_warning_alerts(id) ON DELETE CASCADE,
    channel broadcast_channel_enum NOT NULL,
    recipient_phone VARCHAR(50),
    recipient_email VARCHAR(255),
    recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    delivery_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'read', 'failed'
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- Scénarios climatiques (données GIEC, projections locales)
CREATE TABLE climate_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    scenario_name VARCHAR(255) NOT NULL,
    scenario_source VARCHAR(255),            -- 'IPCC', 'national_meteo', 'research', 'custom'
    time_horizon INTEGER,                    -- année cible (2030, 2050, 2100)
    -- Paramètres climatiques projetés
    temperature_increase_c NUMERIC(4,2),
    rainfall_change_pct NUMERIC(6,2),
    sea_level_rise_cm NUMERIC(6,2),
    extreme_events_frequency_pct NUMERIC(6,2),
    flood_risk_change_pct NUMERIC(6,2),
    drought_risk_change_pct NUMERIC(6,2),
    -- Données détaillées
    scenario_data JSONB,
    status climate_scenario_status_enum DEFAULT 'active',
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_climate_scenarios_updated_at BEFORE UPDATE ON climate_scenarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Plans d'adaptation climatique par municipalité
CREATE TABLE adaptation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    scenario_id UUID REFERENCES climate_scenarios(id) ON DELETE SET NULL,
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Actions prévues
    actions JSONB,                           -- liste d'actions structurées
    estimated_budget NUMERIC(15,2),
    currency VARCHAR(3) DEFAULT 'XOF',
    implementation_period_years INTEGER,
    -- Suivi
    status adaptation_plan_status_enum DEFAULT 'draft',
    adopted_at TIMESTAMPTZ,
    evaluation_date DATE,
    -- Responsables
    responsible_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_adaptation_plans_updated_at BEFORE UPDATE ON adaptation_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Données historiques d'inondations (pour entraînement ML)
CREATE TABLE flood_historical_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    occurred_at DATE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    severity risk_level_enum,
    affected_population INTEGER,
    estimated_damage_xof NUMERIC(15,2),
    water_level_cm NUMERIC(10,2),
    rainfall_mm NUMERIC(10,2),
    -- Source de la donnée
    data_source VARCHAR(100),                -- 'news', 'government_report', 'ngo', 'scientific_paper', 'community'
    source_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 22. RECOMMANDATIONS D'ÉVOLUTION — NOTIFICATIONS INTELLIGENTES & RÈGLES AUTOMATIQUES (P1)
--    Déclenchement automatique basé sur seuils, événements, prédictions ML
-- ============================================================================

-- Templates de notification paramétrables
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    title_template TEXT NOT NULL,            -- template avec variables {{var}}
    body_template TEXT NOT NULL,
    notification_type notification_type_enum NOT NULL,
    category VARCHAR(100),                   -- 'alert', 'reminder', 'report', 'system'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Règles de déclenchement automatique des notifications
CREATE TABLE notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES notification_templates(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    trigger_type notification_rule_trigger_enum NOT NULL,
    -- Configuration de la règle
    entity_type VARCHAR(100) NOT NULL,       -- 'weather_measurement', 'flood_prediction', 'technician_report', etc.
    trigger_condition JSONB NOT NULL,        -- ex: {"field": "rainfall_mm", "operator": ">", "value": 50}
    cooldown_minutes INTEGER DEFAULT 60,     -- délai minimum entre deux déclenchements
    -- Cibles de notification
    target_roles UUID[] DEFAULT '{}',        -- rôles à notifier
    target_users UUID[] DEFAULT '{}',        -- utilisateurs spécifiques
    target_municipality_level BOOLEAN DEFAULT TRUE,  -- notifier aussi le niveau municipal
    target_region_level BOOLEAN DEFAULT FALSE,       -- notifier aussi le niveau régional
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_notification_rules_updated_at BEFORE UPDATE ON notification_rules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Logs de déclenchement des règles
CREATE TABLE notification_rule_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES notification_rules(id) ON DELETE CASCADE,
    trigger_entity_type VARCHAR(100),
    trigger_entity_id UUID,
    trigger_values JSONB,                    -- valeurs ayant déclenché la règle
    notifications_sent INTEGER DEFAULT 0,
    error_message TEXT,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 23. RECOMMANDATIONS D'ÉVOLUTION — MARKETPLACE PRESTATAIRES (P2)
--    PME locales, artisans certifiés, contrats de sous-traitance
-- ============================================================================

-- Prestataires de services (PME, artisans certifiés)
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    -- Spécialités
    service_categories TEXT[],               -- 'drain_cleaning', 'waste_collection', 'road_repair', etc.
    coverage_municipality_ids UUID[] DEFAULT '{}',
    -- Certification & évaluation
    is_certified BOOLEAN DEFAULT FALSE,
    certified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    certified_at TIMESTAMPTZ,
    average_rating NUMERIC(3,2) CHECK (average_rating BETWEEN 0 AND 5),
    total_contracts INTEGER DEFAULT 0,
    completed_contracts INTEGER DEFAULT 0,
    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Contrats de sous-traitance
CREATE TABLE service_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    contract_type VARCHAR(100) NOT NULL,     -- 'drain_cleaning', 'waste_collection', 'road_maintenance', 'other'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    -- Aspects financiers
    contract_amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    payment_terms TEXT,
    -- Période
    start_date DATE NOT NULL,
    end_date DATE,
    -- Liens opérationnels
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    -- Statut
    status contract_status_enum DEFAULT 'draft',
    signed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    signed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    -- Évaluation post-contrat
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_service_contracts_updated_at BEFORE UPDATE ON service_contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- 24. RECOMMANDATIONS D'ÉVOLUTION — GOUVERNANCE & ODD (P0)
--    Dashboard national, indicateurs ODD, pilotage performance
-- ============================================================================

-- Indicateurs alignés sur les Objectifs de Développement Durable (ODD/SDG)
CREATE TABLE sdg_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sdg_goal sdg_goal_enum NOT NULL,
    indicator_code VARCHAR(50) UNIQUE NOT NULL,   -- ex: '6.1.1', '11.5.1', '13.1.1'
    indicator_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),                              -- '%', 'km', 'persons', etc.
    target_value NUMERIC(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valeurs des indicateurs ODD par région/municipalité et période
CREATE TABLE sdg_indicator_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id UUID NOT NULL REFERENCES sdg_indicators(id) ON DELETE CASCADE,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES municipalities(id) ON DELETE SET NULL,
    period VARCHAR(7) NOT NULL,                    -- '2026-01', '2026-Q1', '2026'
    value NUMERIC(15,2) NOT NULL,
    data_source VARCHAR(255),
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_id, municipality_id, period)
);

-- Dashboard national consolidé
CREATE TABLE national_dashboard_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_name VARCHAR(255) NOT NULL,
    view_type VARCHAR(100) NOT NULL,               -- 'executive', 'regional_comparison', 'sdg_progress', 'budget'
    configuration JSONB NOT NULL,                  -- widgets, filtres, périodes
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_national_dashboard_views_updated_at BEFORE UPDATE ON national_dashboard_views FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Demandes de données (open data, chercheurs, ONG)
CREATE TABLE data_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_name VARCHAR(255) NOT NULL,
    requester_organization VARCHAR(255),
    requester_email VARCHAR(255) NOT NULL,
    requester_type VARCHAR(50),                    -- 'researcher', 'ngo', 'journalist', 'citizen', 'government'
    requested_datasets TEXT[],
    purpose TEXT,
    status VARCHAR(50) DEFAULT 'pending',          -- 'pending', 'approved', 'rejected', 'fulfilled'
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    response_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 25. RECOMMANDATIONS D'ÉVOLUTION — MACHINE LEARNING & IA (P1)
--    Versioning des modèles, datasets d'entraînement, facteurs de corrélation
-- ============================================================================

-- Datasets d'entraînement pour les modèles ML
CREATE TABLE ml_training_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name VARCHAR(255) NOT NULL,
    dataset_type VARCHAR(100) NOT NULL,            -- 'flood_prediction', 'risk_scoring', 'maintenance_prediction'
    description TEXT,
    features TEXT[],                               -- liste des colonnes/features
    target_variable VARCHAR(100),                  -- variable à prédire
    record_count INTEGER DEFAULT 0,
    data_source_tables TEXT[],                     -- tables sources
    data_period_start DATE,
    data_period_end DATE,
    file_url TEXT,                                 -- export CSV/Parquet
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_ml_training_datasets_updated_at BEFORE UPDATE ON ml_training_datasets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Versions des modèles ML déployés
CREATE TABLE ml_model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES ml_training_datasets(id) ON DELETE SET NULL,
    model_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(100),                       -- 'random_forest', 'xgboost', 'lstm', 'prophet', 'custom'
    version VARCHAR(50) NOT NULL,
    description TEXT,
    -- Métriques de performance
    accuracy NUMERIC(5,2),
    precision NUMERIC(5,2),
    recall NUMERIC(5,2),
    f1_score NUMERIC(5,2),
    rmse NUMERIC(10,4),
    -- Déploiement
    is_deployed BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    model_artifact_url TEXT,                       -- chemin vers le fichier pickle/onnx/h5
    hyperparameters JSONB,
    -- Suivi
    training_started_at TIMESTAMPTZ,
    training_completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_name, version)
);

-- Logs de prédictions ML
CREATE TABLE ml_prediction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id UUID NOT NULL REFERENCES ml_model_versions(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,             -- 'flood_risk', 'maintenance_need', 'waste_accumulation'
    entity_id UUID,
    input_data JSONB,
    predicted_value NUMERIC(15,4),
    confidence_score NUMERIC(5,2),
    prediction_date TIMESTAMPTZ NOT NULL,
    was_accurate BOOLEAN,                          -- feedback post-événement
    actual_value NUMERIC(15,4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 26. INDEXES DE PERFORMANCE
-- ============================================================================

-- === Indexes GIST (Spatiaux) ===
CREATE INDEX idx_regions_geometry ON regions USING GIST(geometry);
CREATE INDEX idx_municipalities_geometry ON municipalities USING GIST(geometry);
CREATE INDEX idx_districts_geometry ON districts USING GIST(geometry);
CREATE INDEX idx_neighborhoods_geometry ON neighborhoods USING GIST(geometry);
CREATE INDEX idx_gis_features_geometry ON gis_features USING GIST(geometry);
CREATE INDEX idx_risk_zones_geometry ON risk_zones USING GIST(geometry);
CREATE INDEX idx_critical_points_location ON critical_points USING GIST(location);
CREATE INDEX idx_drainage_networks_geometry ON drainage_networks USING GIST(geometry);
CREATE INDEX idx_mapped_areas_geometry ON mapped_areas USING GIST(geometry);
CREATE INDEX idx_infrastructures_geometry ON infrastructures USING GIST(geometry);
CREATE INDEX idx_drainage_structures_geometry ON drainage_structures USING GIST(geometry);
CREATE INDEX idx_weather_stations_location ON weather_stations USING GIST(location);
CREATE INDEX idx_environmental_sensors_location ON environmental_sensors USING GIST(location);
CREATE INDEX idx_flood_events_geometry ON flood_events USING GIST(geometry);
CREATE INDEX idx_technician_reports_location ON technician_reports USING GIST(location);
CREATE INDEX idx_user_tracking_logs_location ON user_tracking_logs USING GIST(location);
CREATE INDEX idx_roads_geometry ON roads USING GIST(geometry);
CREATE INDEX idx_warehouses_location ON warehouses USING GIST(location);
CREATE INDEX idx_urban_flora_location ON urban_flora USING GIST(location);
CREATE INDEX idx_protected_areas_geometry ON protected_areas USING GIST(geometry);
CREATE INDEX idx_biodiversity_observations_location ON biodiversity_observations USING GIST(location);
CREATE INDEX idx_waste_valorization_centers_location ON waste_valorization_centers USING GIST(location);
CREATE INDEX idx_waste_points_location ON waste_points USING GIST(location);
CREATE INDEX idx_unsanitary_zones_geometry ON unsanitary_zones USING GIST(geometry);
CREATE INDEX idx_potholes_location ON potholes USING GIST(location);
CREATE INDEX idx_incidents_geometry ON incidents USING GIST(geometry);
CREATE INDEX idx_missions_location ON missions USING GIST(location);
CREATE INDEX idx_vehicle_tracking_logs_location ON vehicle_tracking_logs USING GIST(location);
CREATE INDEX idx_equipment_tracking_logs_location ON equipment_tracking_logs USING GIST(location);
CREATE INDEX idx_attendance_logs_location ON attendance_logs USING GIST(location);

-- === Indexes B-Tree (FK et recherches fréquentes) ===
-- Auth & Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_municipality_id ON users(municipality_id);
CREATE INDEX idx_users_district_id ON users(district_id);
CREATE INDEX idx_users_region_id ON users(region_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_role_user_user ON role_user(user_id);
CREATE INDEX idx_role_user_role ON role_user(role_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Territory
CREATE INDEX idx_districts_municipality_id ON districts(municipality_id);
CREATE INDEX idx_neighborhoods_district_id ON neighborhoods(district_id);
CREATE INDEX idx_municipalities_region_id ON municipalities(region_id);

-- Teams
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_field_teams_municipality ON field_teams(municipality_id);

-- Technician Reports
CREATE INDEX idx_technician_reports_status ON technician_reports(status);
CREATE INDEX idx_technician_reports_created_by ON technician_reports(created_by);
CREATE INDEX idx_technician_reports_assigned_to ON technician_reports(assigned_to);
CREATE INDEX idx_technician_reports_neighborhood_id ON technician_reports(neighborhood_id);
CREATE INDEX idx_technician_reports_district_id ON technician_reports(district_id);
CREATE INDEX idx_technician_reports_municipality_id ON technician_reports(municipality_id);
CREATE INDEX idx_technician_reports_region_id ON technician_reports(region_id);
CREATE INDEX idx_technician_reports_deleted_at ON technician_reports(deleted_at);
CREATE INDEX idx_technician_reports_created_at ON technician_reports(created_at DESC);

-- Report Comments & Assignments
CREATE INDEX idx_report_comments_report ON report_comments(report_id);
CREATE INDEX idx_technician_report_assignments_report ON technician_report_assignments(report_id);

-- Missions & Interventions
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_report_id ON missions(report_id);
CREATE INDEX idx_missions_due_date ON missions(due_date);
CREATE INDEX idx_missions_assigned_team ON missions(assigned_team_id);
CREATE INDEX idx_mission_checklist_mission ON mission_checklist(mission_id);
CREATE INDEX idx_interventions_assigned_user ON interventions(assigned_to_user_id);
CREATE INDEX idx_interventions_mission ON interventions(mission_id);

-- Incidents
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_municipality ON incidents(municipality_id);

-- Weather
CREATE INDEX idx_weather_measurements_date ON weather_measurements(measured_at);
CREATE INDEX idx_weather_measurements_station ON weather_measurements(station_id);

-- Media
CREATE INDEX idx_media_related ON media(related_id, related_type);
CREATE INDEX idx_media_uploader ON media(uploader_id);

-- Inventory
CREATE INDEX idx_inventory_items_warehouse ON inventory_items(warehouse_id);
CREATE INDEX idx_inventory_movements_item ON inventory_movements(inventory_item_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Audit
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Environmental
CREATE INDEX idx_air_quality_logs_sensor ON air_quality_logs(sensor_id);
CREATE INDEX idx_air_quality_logs_date ON air_quality_logs(measured_at);
CREATE INDEX idx_water_quality_logs_sensor ON water_quality_logs(sensor_id);
CREATE INDEX idx_water_quality_logs_date ON water_quality_logs(measured_at);

-- === Indexes GIN (JSONB) ===
CREATE INDEX idx_gis_features_properties ON gis_features USING GIN (properties);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);
CREATE INDEX idx_field_form_submissions_data ON field_form_submissions USING GIN (form_data);
CREATE INDEX idx_environmental_sensors_last_reading ON environmental_sensors USING GIN (last_reading);


-- New recommendation tables — Finance & Budget
CREATE INDEX idx_budgets_municipality ON budgets(municipality_id, fiscal_year);
CREATE INDEX idx_expenditures_budget ON expenditures(budget_id);
CREATE INDEX idx_expenditures_mission ON expenditures(mission_id);
CREATE INDEX idx_donor_projects_municipality ON donor_projects(municipality_id);
CREATE INDEX idx_donor_projects_status ON donor_projects(status);

-- New recommendation tables — Citizen Reports
CREATE INDEX idx_citizen_reports_location ON citizen_reports USING GIST(location);
CREATE INDEX idx_citizen_reports_status ON citizen_reports(status);
CREATE INDEX idx_citizen_reports_user ON citizen_reports(user_id);
CREATE INDEX idx_chatbot_sessions_external ON chatbot_sessions(platform, external_user_id);

-- New recommendation tables — Early Warning & Climate
CREATE INDEX idx_early_warning_alerts_region ON early_warning_alerts(region_id);
CREATE INDEX idx_early_warning_alerts_municipality ON early_warning_alerts(municipality_id);
CREATE INDEX idx_early_warning_alerts_status ON early_warning_alerts(broadcast_status);
CREATE INDEX idx_alert_broadcast_logs_alert ON alert_broadcast_logs(alert_id);
CREATE INDEX idx_climate_scenarios_region ON climate_scenarios(region_id);
CREATE INDEX idx_adaptation_plans_municipality ON adaptation_plans(municipality_id);
CREATE INDEX idx_flood_historical_events_municipality ON flood_historical_events(municipality_id);
CREATE INDEX idx_flood_historical_events_date ON flood_historical_events(occurred_at);
CREATE INDEX idx_flood_historical_events_geometry ON flood_historical_events USING GIST(geometry);

-- New recommendation tables — Notification Intelligence
CREATE INDEX idx_notification_rules_template ON notification_rules(template_id);
CREATE INDEX idx_notification_rules_active ON notification_rules(is_active);
CREATE INDEX idx_notification_rule_logs_rule ON notification_rule_logs(rule_id);

-- New recommendation tables — Marketplace
CREATE INDEX idx_service_providers_categories ON service_providers USING GIN(service_categories);
CREATE INDEX idx_service_contracts_provider ON service_contracts(provider_id);
CREATE INDEX idx_service_contracts_status ON service_contracts(status);

-- New recommendation tables — Governance & SDG
CREATE INDEX idx_sdg_indicator_values_indicator ON sdg_indicator_values(indicator_id);
CREATE INDEX idx_sdg_indicator_values_municipality ON sdg_indicator_values(municipality_id, period);
CREATE INDEX idx_data_requests_status ON data_requests(status);

-- New recommendation tables — ML
CREATE INDEX idx_ml_model_versions_dataset ON ml_model_versions(dataset_id);
CREATE INDEX idx_ml_model_versions_deployed ON ml_model_versions(is_deployed);
CREATE INDEX idx_ml_prediction_logs_model ON ml_prediction_logs(model_version_id);
CREATE INDEX idx_ml_prediction_logs_date ON ml_prediction_logs(prediction_date);
CREATE INDEX idx_ml_prediction_logs_entity ON ml_prediction_logs(entity_type, entity_id);


-- ============================================================================
-- 27. TRIGGERS (updated_at automatique)
-- ============================================================================

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_field_teams_updated_at
    BEFORE UPDATE ON field_teams
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_infrastructures_updated_at
    BEFORE UPDATE ON infrastructures
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_drainage_structures_updated_at
    BEFORE UPDATE ON drainage_structures
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_technician_reports_updated_at
    BEFORE UPDATE ON technician_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_urban_flora_updated_at
    BEFORE UPDATE ON urban_flora
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_protected_areas_updated_at
    BEFORE UPDATE ON protected_areas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_environmental_sensors_updated_at
    BEFORE UPDATE ON environmental_sensors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================================
-- FIN DU SCHÉMA FINAL CONSOLIDÉ
-- ============================================================================
-- TOTAL GÉNÉRAL :
--   40 enums (25 existants + 12 recommandations + 3 corrigés)
--   108 tables (84 existantes + 24 nouvelles recommandations)
--   118+ index (30 GIST + 70+ B-Tree + 4 GIN + index recommandations)
--   25 triggers (9 existants + 16 nouveaux sur tables recommandations)
--
-- RECOMMANDATIONS D'ÉVOLUTION INTÉGRÉES (P0-P2) :
--   P0 (Section 19) : Finance & Budget — budgets, expenditures, donor_projects
--   P0 (Section 20) : Citoyen Mobile — citizen_reports, chatbot_sessions
--   P0 (Section 21) : Alerte Précoce & Résilience Climatique — early_warning_alerts,
--                     alert_broadcast_logs, climate_scenarios, adaptation_plans,
--                     flood_historical_events
--   P1 (Section 22) : Notifications Intelligentes — notification_templates,
--                     notification_rules, notification_rule_logs
--   P2 (Section 23) : Marketplace Prestataires — service_providers, service_contracts
--   P0 (Section 24) : Gouvernance & ODD — sdg_indicators, sdg_indicator_values,
--                     national_dashboard_views, data_requests
--   P1 (Section 25) : Machine Learning & IA — ml_training_datasets,
--                     ml_model_versions, ml_prediction_logs
-- ============================================================================
