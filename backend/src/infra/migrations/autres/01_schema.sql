-- HSE TERRA — COMPLETE DATABASE SCHEMA (schema.sql)

-- ============================================================================
-- HSE TERRA
-- SMART CITY & URBAN OPERATIONS PLATFORM
-- Complete PostgreSQL + PostGIS Database Schema
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Types de rôles utilisateurs
CREATE TYPE user_role_enum AS ENUM (
    'super_admin',
    'platform_admin',
    'ministry',
    'prefecture_director',
    'mayor',
    'dst_manager',
    'sgds_manager',
    'supervisor',
    'team_leader',
    'technician',
    'viewer'
);

-- Statut utilisateur
CREATE TYPE user_status_enum AS ENUM (
    'pending',
    'active',
    'suspended',
    'disabled'
);

-- Type organisation
CREATE TYPE organization_type_enum AS ENUM (
    'sgds',
    'dst',
    'municipality',
    'ministry',
    'prefecture',
    'private_contractor'
);

-- Niveau de risque
CREATE TYPE risk_level_enum AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Niveau de priorité
CREATE TYPE priority_level_enum AS ENUM (
    'low',
    'medium',
    'high',
    'critical',
    'emergency'
);

-- Statut mission
CREATE TYPE mission_status_enum AS ENUM (
    'draft',
    'planned',
    'assigned',
    'in_progress',
    'completed',
    'validated',
    'cancelled'
);

-- Type mission
CREATE TYPE mission_type_enum AS ENUM (
    'drain_cleaning',
    'waste_collection',
    'road_repair',
    'flood_response',
    'inspection',
    'emergency_response',
    'sanitation',
    'maintenance',
    'reforestation',
    'ecological_restoration',
    'biodiversity_survey'
);

-- Statut incident
CREATE TYPE incident_status_enum AS ENUM (
    'reported',
    'under_review',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected'
);

-- Type incident
CREATE TYPE incident_type_enum AS ENUM (
    'flood_risk',
    'blocked_drain',
    'waste_accumulation',
    'road_damage',
    'erosion',
    'stagnant_water',
    'illegal_dumping',
    'collapsed_structure',
    'bridge_damage',
    'street_light_failure',
    'wildlife_incident',
    'deforestation',
    'water_pollution',
    'other'
);

-- Type géométrie SIG
CREATE TYPE geometry_type_enum AS ENUM (
    'point',
    'line',
    'polygon',
    'multipolygon',
    'multiline'
);

-- Statut maintenance
CREATE TYPE maintenance_status_enum AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled',
    'delayed'
);

-- Type infrastructure
CREATE TYPE infrastructure_type_enum AS ENUM (
    'road',
    'drain',
    'bridge',
    'culvert',
    'retention_basin',
    'sidewalk',
    'street_light',
    'canal',
    'market',
    'waste_site',
    'public_building',
    'wetland',
    'urban_forest',
    'eco_corridor',
    'other'
);

-- Statut workflow validation
CREATE TYPE approval_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);

-- Type notification
CREATE TYPE notification_type_enum AS ENUM (
    'sms',
    'email',
    'push',
    'system'
);

-- Statut synchronisation offline
CREATE TYPE sync_status_enum AS ENUM (
    'pending',
    'synced',
    'failed'
);

-- Type mouvement stock
CREATE TYPE inventory_movement_type_enum AS ENUM (
    'in',
    'out',
    'transfer',
    'adjustment'
);

-- Statut véhicule
CREATE TYPE vehicle_status_enum AS ENUM (
    'available',
    'assigned',
    'maintenance',
    'out_of_service'
);

-- Statut équipement
CREATE TYPE equipment_status_enum AS ENUM (
    'available',
    'assigned',
    'maintenance',
    'damaged',
    'lost'
);

-- Météo & Climat
CREATE TYPE weather_provider_type_enum AS ENUM (
    'api',
    'satellite',
    'ground_station',
    'manual'
);

CREATE TYPE weather_sync_status_enum AS ENUM (
    'success',
    'partial',
    'failed'
);

CREATE TYPE drainage_condition_status_enum AS ENUM (
    'excellent',
    'good',
    'degraded',
    'critical',
    'collapsed'
);

CREATE TYPE water_flow_status_enum AS ENUM (
    'normal',
    'reduced',
    'blocked',
    'overflowing'
);

-- Terrain
-- Terrain
CREATE TYPE field_report_status_enum AS ENUM (
    'draft',
    'submitted',
    'assigned',
    'in_progress',
    'resolved',
    'validated',
    'rejected'
);

CREATE TYPE field_assignment_status_enum AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE issue_category_enum AS ENUM (
    'drainage',
    'waste',
    'road',
    'lighting',
    'flooding',
    'biodiversity',
    'air_quality',
    'water_quality',
    'other'
);

CREATE TYPE type_account_enum AS ENUM (
    'user',
    'admin',
    'organization',
    'municipality',
    'district',
    'neighborhood',
    'field_agent',
    'technician',
    'partner',
    'supplier',
    'citizen'
);


-- ============================================================================
-- CORE ENTITIES (AUTH & ORG)
-- ============================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

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

CREATE TABLE municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    municipality_id UUID REFERENCES municipalities(id),
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    department VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    type type_account_enum DEFAULT 'user',
    status user_status_enum DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Historique des changements de statut pour audit
CREATE TABLE user_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    old_status user_status_enum,
    new_status user_status_enum,
    reason TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_user(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions_user(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP pour validation de compte et réinitialisation de mot de passe (Table unifiée)
CREATE TABLE user_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    otp_type VARCHAR(50) NOT NULL, -- 'account_activation', 'password_reset', 'email_change'
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Préférences et profil étendu de l'utilisateur
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

CREATE TRIGGER trg_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255),
    entity_name VARCHAR(255),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEAMS & HR
-- ============================================================================

CREATE TABLE field_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    team_type VARCHAR(100),
    description TEXT,
    status user_status_enum DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES field_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ
);

CREATE TABLE staff_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    old_role_id UUID REFERENCES roles(id),
    new_role_id UUID REFERENCES roles(id),
    promoted_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE staff_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    old_team_id UUID REFERENCES field_teams(id),
    new_team_id UUID REFERENCES field_teams(id),
    transferred_by UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES field_teams(id),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GIS & INFRASTRUCTURE
-- ============================================================================

CREATE TABLE gis_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    name VARCHAR(255) NOT NULL,
    layer_type VARCHAR(100),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gis_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer_id UUID REFERENCES gis_layers(id) ON DELETE CASCADE,
    feature_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    severity_level risk_level_enum,
    geometry GEOMETRY(Geometry, 4326),
    properties JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    zone_type VARCHAR(100),
    risk_level risk_level_enum,
    title VARCHAR(255),
    description TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE critical_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    point_type VARCHAR(100),
    severity_level risk_level_enum,
    title VARCHAR(255),
    description TEXT,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drainage_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    name VARCHAR(255),
    drainage_type VARCHAR(100),
    status VARCHAR(100),
    geometry GEOMETRY(MULTILINESTRING, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mapped_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    name VARCHAR(255) NOT NULL,
    area_type VARCHAR(100),
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE infrastructures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    infrastructure_type infrastructure_type_enum,
    name VARCHAR(255),
    condition_status drainage_condition_status_enum,
    construction_year INTEGER,
    geometry GEOMETRY(Geometry, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- WEATHER & CLIMATE
-- ============================================================================

CREATE TABLE weather_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    provider_type weather_provider_type_enum NOT NULL,
    api_url TEXT,
    api_key_encrypted TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weather_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES weather_sources(id),
    municipality_id UUID REFERENCES municipalities(id),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    altitude_m NUMERIC(8,2),
    active BOOLEAN DEFAULT TRUE,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE weather_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    source_id UUID REFERENCES weather_sources(id),
    forecast_date DATE NOT NULL,
    rainfall_mm NUMERIC(8,2),
    temperature_c NUMERIC(5,2),
    humidity_pct NUMERIC(5,2),
    wind_speed_kmh NUMERIC(6,2),
    predicted_risk_level risk_level_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    source_id UUID REFERENCES weather_sources(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    alert_level risk_level_enum NOT NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weather_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES weather_sources(id),
    sync_status weather_sync_status_enum NOT NULL,
    records_imported INTEGER DEFAULT 0,
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FLOOD RISK
-- ============================================================================

CREATE TABLE flood_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    mapped_area_id UUID REFERENCES mapped_areas(id),
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

CREATE TABLE hydraulic_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    structure_id UUID NOT NULL REFERENCES drainage_structures(id) ON DELETE CASCADE,
    inspected_by UUID REFERENCES users(id),
    obstruction_level_pct NUMERIC(5,2),
    water_flow_status water_flow_status_enum,
    structural_damage_pct NUMERIC(5,2),
    notes TEXT,
    inspected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE flood_prediction_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    description TEXT,
    accuracy_pct NUMERIC(5,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE flood_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapped_area_id UUID REFERENCES mapped_areas(id),
    model_id UUID REFERENCES flood_prediction_models(id),
    predicted_risk_level risk_level_enum,
    predicted_flood_probability_pct NUMERIC(5,2),
    expected_rainfall_mm NUMERIC(10,2),
    prediction_date TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FIELD OPERATIONS (TECHNICIANS)
-- ============================================================================

CREATE TABLE technician_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Localisation et Contexte
    municipality_id UUID REFERENCES municipalities(id),
    district_id UUID REFERENCES districts(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    infrastructure_id UUID REFERENCES infrastructures(id),
    mapped_area_id UUID REFERENCES mapped_areas(id),
    
    -- Contenu Principal
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issue_category issue_category_enum NOT NULL,
    priority priority_level_enum DEFAULT 'medium',
    risk_level risk_level_enum DEFAULT 'medium',
    status field_report_status_enum DEFAULT 'submitted',
    
    -- Géolocalisation
    location GEOMETRY(Point, 4326),
    
    -- Métadonnées de Traçabilité
    created_by UUID NOT NULL REFERENCES users(id),
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- EXTENSIONS DE RAPPORTS (Class Table Inheritance / 1:1 Normalization)
-- ============================================================================

CREATE TABLE report_details_drainage (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    blockage_level_pct NUMERIC(5,2) CHECK (blockage_level_pct BETWEEN 0 AND 100),
    water_level_cm NUMERIC(8,2) CHECK (water_level_cm >= 0),
    flow_status water_flow_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_details_road (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    damage_surface_m2 NUMERIC(8,2) CHECK (damage_surface_m2 >= 0),
    pothole_depth_cm NUMERIC(5,2) CHECK (pothole_depth_cm >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_details_waste (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    estimated_volume_m3 NUMERIC(8,2) CHECK (estimated_volume_m3 >= 0),
    waste_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_details_biodiversity (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    species_name VARCHAR(255),
    observation_type VARCHAR(50), -- 'fauna', 'flora'
    count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE report_details_environment (
    report_id UUID PRIMARY KEY REFERENCES technician_reports(id) ON DELETE CASCADE,
    sensor_id UUID REFERENCES environmental_sensors(id),
    measured_value NUMERIC(12,4),
    unit VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fichiers et Médias (Table unifiée)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size INTEGER,
    media_type VARCHAR(50),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Liaisons pour les médias (Évite le polymorphisme non contraint)
CREATE TABLE technician_report_media (
    report_id UUID REFERENCES technician_reports(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    caption TEXT,
    PRIMARY KEY (report_id, media_id)
);

CREATE TABLE technician_report_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES technician_reports(id) ON DELETE CASCADE,
    assigned_team_id UUID REFERENCES field_teams(id),
    assigned_to UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id),
    assignment_status field_assignment_status_enum DEFAULT 'pending',
    assignment_notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- MISSIONS & OPERATIONS
-- ============================================================================

CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    mission_type mission_type_enum,
    priority_level priority_level_enum,
    title VARCHAR(255),
    description TEXT,
    assigned_team_id UUID REFERENCES field_teams(id),
    status mission_status_enum DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    location geometry(Point, 4326)
);

CREATE TABLE mission_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mission_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id),
    submitted_by UUID REFERENCES users(id),
    report TEXT,
    photos TEXT[],
    completion_percentage INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mission_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID REFERENCES missions(id),
    old_status mission_status_enum,
    new_status mission_status_enum,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- municipality_id et team_id supprimés car déductibles de mission_id
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    intervention_type VARCHAR(100),
    status field_assignment_status_enum,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE field_intervention_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    report_id UUID REFERENCES technician_reports(id),
    created_by UUID REFERENCES users(id),
    work_done TEXT,
    blockage_removed_pct NUMERIC(5,2),
    final_condition_score NUMERIC(5,2),
    recommendations TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- URBAN CLEANLINESS
-- ============================================================================

CREATE TABLE waste_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    waste_type VARCHAR(100),
    severity_level risk_level_enum,
    status VARCHAR(50),
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waste_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waste_point_id UUID REFERENCES waste_points(id),
    collected_by UUID REFERENCES users(id),
    collected_quantity NUMERIC(10,2),
    collection_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sanitation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    title VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE unsanitary_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    severity_level risk_level_enum,
    description TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROADS & INCIDENTS
-- ============================================================================

CREATE TABLE roads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    name VARCHAR(255),
    road_type VARCHAR(100),
    condition_status drainage_condition_status_enum,
    geometry GEOMETRY(MULTILINESTRING, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE potholes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    road_id UUID REFERENCES roads(id),
    severity_level risk_level_enum,
    width_cm NUMERIC(10,2),
    depth_cm NUMERIC(10,2),
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE infrastructure_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id),
    inspected_by UUID REFERENCES users(id),
    condition_status drainage_condition_status_enum,
    risk_level risk_level_enum,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id),
    maintenance_type VARCHAR(100),
    priority_level priority_level_enum,
    estimated_cost NUMERIC(15,2),
    scheduled_date DATE,
    completed_date DATE,
    status maintenance_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE preventive_maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    infrastructure_id UUID REFERENCES infrastructures(id),
    maintenance_frequency_days INTEGER,
    next_maintenance_date DATE,
    estimated_future_cost NUMERIC(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    incident_type incident_type_enum,
    severity_level risk_level_enum,
    title VARCHAR(255),
    description TEXT,
    status incident_status_enum DEFAULT 'reported',
    geometry GEOMETRY(Geometry, 4326),
    reported_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incident_media (
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    location GEOMETRY(Point, 4326),
    PRIMARY KEY (incident_id, media_id)
);

CREATE TABLE inspection_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    inspected_by UUID REFERENCES users(id),
    form_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);



-- ============================================================================
-- LOGISTICS & TRACKING
-- ============================================================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    registration_number VARCHAR(100),
    vehicle_type VARCHAR(100),
    status vehicle_status_enum DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    speed NUMERIC(10,2),
    location GEOMETRY(Point, 4326),
    tracked_at TIMESTAMPTZ
);

-- Table unifiée pour le tracking des utilisateurs sur le terrain
CREATE TABLE user_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id),
    team_id UUID REFERENCES field_teams(id),
    speed_kmh NUMERIC(6,2),
    accuracy_meters NUMERIC(6,2),
    battery_level INTEGER,
    location GEOMETRY(Point, 4326),
    tracked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE field_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    equipment_type VARCHAR(100),
    serial_number VARCHAR(255),
    status equipment_status_enum DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE equipment_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES field_equipment(id),
    location GEOMETRY(Point, 4326),
    tracked_at TIMESTAMPTZ
);

-- ============================================================================
-- COMMUNICATION & WORKFLOW
-- ============================================================================

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    alert_type VARCHAR(100),
    severity_level risk_level_enum,
    title VARCHAR(255),
    message TEXT,
    status VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    notification_type notification_type_enum,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incident_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    escalated_to UUID REFERENCES users(id),
    escalation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    workflow_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    role_id UUID REFERENCES roles(id),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    approved_by UUID REFERENCES users(id),
    approval_status approval_status_enum,
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    incident_type incident_type_enum,
    priority_level priority_level_enum,
    max_response_minutes INTEGER,
    max_resolution_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    sla_policy_id UUID REFERENCES sla_policies(id),
    response_deadline TIMESTAMPTZ,
    resolution_deadline TIMESTAMPTZ,
    breached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY & FINANCE
-- ============================================================================

CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id),
    item_name VARCHAR(255) NOT NULL,
    item_category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    minimum_threshold INTEGER DEFAULT 0,
    unit VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id),
    movement_type inventory_movement_type_enum,
    quantity INTEGER,
    reference_type VARCHAR(100),
    reference_id UUID,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    organization_id UUID REFERENCES organizations(id),
    order_number VARCHAR(100) UNIQUE,
    total_amount NUMERIC(15,2),
    status VARCHAR(50),
    ordered_by UUID REFERENCES users(id),
    ordered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MOBILE & SMART FEATURES
-- ============================================================================

CREATE TABLE mobile_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    device_uuid VARCHAR(255) UNIQUE,
    device_name VARCHAR(255),
    platform VARCHAR(50),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mobile_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    device_identifier VARCHAR(255),
    sync_type VARCHAR(50),
    sync_status sync_status_enum,
    records_uploaded INTEGER DEFAULT 0,
    records_downloaded INTEGER DEFAULT 0,
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID REFERENCES mobile_devices(id),
    entity_type VARCHAR(100),
    entity_id UUID,
    operation_type VARCHAR(50),
    payload JSONB,
    sync_status sync_status_enum,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE field_collection_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE field_form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES field_collection_forms(id),
    submitted_by UUID REFERENCES users(id),
    report_id UUID REFERENCES technician_reports(id),
    form_data JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE smart_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    recommendation_type VARCHAR(100),
    priority_level priority_level_enum,
    recommendation_text TEXT,
    source_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_zone_id UUID REFERENCES risk_zones(id),
    previous_score NUMERIC(10,2),
    new_score NUMERIC(10,2),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & OPEN DATA
-- ============================================================================

CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    metric_name VARCHAR(255),
    metric_value NUMERIC(15,2),
    metric_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE strategic_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    report_type VARCHAR(100),
    title VARCHAR(255),
    report_data JSONB,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE open_data_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    dataset_name VARCHAR(255),
    dataset_type VARCHAR(100),
    file_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    widget_name VARCHAR(255),
    widget_type VARCHAR(100),
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BIODIVERSITY & ENVIRONMENT
-- ============================================================================

-- Patrimoine végétal et forêts urbaines
CREATE TABLE urban_flora (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    species_name VARCHAR(255),
    common_name VARCHAR(255),
    health_status VARCHAR(50), -- 'healthy', 'diseased', 'dead', 'under_treatment'
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

CREATE TRIGGER trg_urban_flora_updated_at BEFORE UPDATE ON urban_flora FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Zones protégées et corridors écologiques
CREATE TABLE protected_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    name VARCHAR(255) NOT NULL,
    protection_level VARCHAR(100), -- 'integral', 'managed', 'recreation'
    area_type infrastructure_type_enum, -- 'wetland', 'urban_forest', etc.
    description TEXT,
    regulations TEXT,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_protected_areas_updated_at BEFORE UPDATE ON protected_areas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Capteurs environnementaux (Air, Eau, Bruit)
CREATE TABLE environmental_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    station_name VARCHAR(255),
    sensor_type VARCHAR(50), -- 'air_quality', 'water_ph', 'noise', 'soil_moisture'
    model_info VARCHAR(255),
    location GEOMETRY(Point, 4326),
    active BOOLEAN DEFAULT TRUE,
    last_reading JSONB,
    last_reading_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_environmental_sensors_updated_at BEFORE UPDATE ON environmental_sensors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Mesures de la qualité de l'air
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

-- Mesures de la qualité de l'eau
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

-- Observations de la biodiversité (Faune/Flore)
CREATE TABLE biodiversity_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    observer_id UUID REFERENCES users(id),
    species_name VARCHAR(255),
    common_name VARCHAR(255),
    observation_type VARCHAR(50), -- 'fauna', 'flora', 'fungi'
    count INTEGER DEFAULT 1,
    description TEXT,
    location GEOMETRY(Point, 4326),
    media_urls TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Économie circulaire (Valorisation des déchets)
CREATE TABLE waste_valorization_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    name VARCHAR(255) NOT NULL,
    center_type VARCHAR(100), -- 'composting', 'sorting', 'recycling'
    capacity_tons_day NUMERIC(10,2),
    location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waste_valorization_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID REFERENCES waste_valorization_centers(id),
    waste_type VARCHAR(100),
    input_quantity_kg NUMERIC(12,2),
    output_product VARCHAR(100), -- 'compost', 'plastic_pellets', etc.
    output_quantity_kg NUMERIC(12,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id)
);

-- ============================================================================
-- COMPLIANCE
-- ============================================================================

CREATE TABLE compliance_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    inspected_entity_type VARCHAR(100),
    inspected_entity_id UUID,
    compliance_status VARCHAR(50),
    notes TEXT,
    inspected_by UUID REFERENCES users(id),
    inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compliance_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES compliance_inspections(id),
    violation_type VARCHAR(100),
    severity_level risk_level_enum,
    penalty_amount NUMERIC(15,2),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Spatial Indexes
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
CREATE INDEX idx_flood_events_geometry ON flood_events USING GIST(geometry);
CREATE INDEX idx_technician_reports_location ON technician_reports USING GIST(location);
CREATE INDEX idx_user_tracking_logs_location ON user_tracking_logs USING GIST(location);
CREATE INDEX idx_roads_geometry ON roads USING GIST(geometry);

-- Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_municipality ON users(municipality_id);
CREATE INDEX idx_districts_municipality ON districts(municipality_id);
CREATE INDEX idx_neighborhoods_district ON neighborhoods(district_id);
CREATE INDEX idx_role_user_user ON role_user(user_id);
CREATE INDEX idx_role_user_role ON role_user(role_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_weather_measurements_date ON weather_measurements(measured_at);
CREATE INDEX idx_weather_measurements_station ON weather_measurements(station_id);
CREATE INDEX idx_technician_reports_status ON technician_reports(status);
CREATE INDEX idx_technician_reports_created_by ON technician_reports(created_by);
CREATE INDEX idx_inventory_items_warehouse ON inventory_items(warehouse_id);

-- JSONB GIN Indexes
CREATE INDEX idx_gis_features_properties ON gis_features USING GIN (properties);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);
CREATE INDEX idx_field_form_submissions_data ON field_form_submissions USING GIN (form_data);


-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_infrastructures_updated_at BEFORE UPDATE ON infrastructures FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_drainage_structures_updated_at BEFORE UPDATE ON drainage_structures FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_technician_reports_updated_at BEFORE UPDATE ON technician_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
