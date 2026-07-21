BEGIN;

-- 1. DROP THE INCORRECT DEPARTMENT COLUMNS FROM PREVIOUS MIGRATION
ALTER TABLE municipalities DROP COLUMN IF EXISTS department_id;
ALTER TABLE users DROP COLUMN IF EXISTS department_id;
ALTER TABLE technician_reports DROP COLUMN IF EXISTS department_id;
ALTER TABLE infrastructures DROP COLUMN IF EXISTS department_id;
ALTER TABLE critical_points DROP COLUMN IF EXISTS department_id;

-- 2. DROP THE INCORRECT DEPARTMENTS TABLE AND CREATE REGIONS
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate regions with the 12 departments of Benin
INSERT INTO regions (name)
VALUES 
    ('Alibori'), ('Atacora'), ('Atlantique'), ('Borgou'), 
    ('Collines'), ('Couffo'), ('Donga'), ('Littoral'), 
    ('Mono'), ('Ouémé'), ('Plateau'), ('Zou')
ON CONFLICT (name) DO NOTHING;

-- 3. ADD region_id TO ALL TARGET TABLES
ALTER TABLE municipalities ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE technician_reports ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE infrastructures ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE critical_points ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE missions ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE flood_events ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE drainage_networks ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE mapped_areas ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE gis_features ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE field_teams ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);

-- Add district and neighborhood to those that didn't get it yet
ALTER TABLE flood_events ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE flood_events ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE risk_zones ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);
ALTER TABLE drainage_networks ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE drainage_networks ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);
ALTER TABLE mapped_areas ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE mapped_areas ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);
ALTER TABLE gis_features ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE gis_features ADD COLUMN IF NOT EXISTS municipality_id UUID REFERENCES municipalities(id);
ALTER TABLE gis_features ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);
ALTER TABLE missions ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE missions ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);
ALTER TABLE field_teams ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE field_teams ADD COLUMN IF NOT EXISTS neighborhood_id UUID REFERENCES neighborhoods(id);

-- 4. UPDATE MUNICIPALITIES region_id based on spatial intersection with regions
UPDATE municipalities m
SET region_id = r.id
FROM regions r
WHERE ST_Intersects(ST_Centroid(m.geometry), r.geometry) AND m.geometry IS NOT NULL;

-- 5. SPATIAL UPDATES FOR TABLES WITH GEOMETRY
-- technician_reports
UPDATE technician_reports t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Contains(n.geometry, t.location) AND t.location IS NOT NULL;

-- infrastructures
UPDATE infrastructures t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Intersects(n.geometry, ST_Centroid(t.geometry)) AND t.geometry IS NOT NULL;

-- critical_points
UPDATE critical_points t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Contains(n.geometry, t.location) AND t.location IS NOT NULL;

-- flood_events
UPDATE flood_events t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Intersects(n.geometry, ST_Centroid(t.geometry)) AND t.geometry IS NOT NULL;

-- risk_zones
UPDATE risk_zones t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Intersects(n.geometry, ST_Centroid(t.geometry)) AND t.geometry IS NOT NULL;

-- drainage_networks
UPDATE drainage_networks t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Intersects(n.geometry, ST_Centroid(t.geometry)) AND t.geometry IS NOT NULL;

-- mapped_areas
UPDATE mapped_areas t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Intersects(n.geometry, ST_Centroid(t.geometry)) AND t.geometry IS NOT NULL;

-- gis_features
UPDATE gis_features t
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    region_id = m.region_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Intersects(n.geometry, ST_Centroid(t.geometry)) AND t.geometry IS NOT NULL;


-- 6. CASCADE REGION_ID FOR NON-SPATIAL TABLES USING MUNICIPALITY_ID
UPDATE users u SET region_id = m.region_id FROM municipalities m WHERE u.municipality_id = m.id AND u.municipality_id IS NOT NULL;
UPDATE field_teams t SET region_id = m.region_id FROM municipalities m WHERE t.municipality_id = m.id AND t.municipality_id IS NOT NULL;
UPDATE missions t SET region_id = m.region_id FROM municipalities m WHERE t.municipality_id = m.id AND t.municipality_id IS NOT NULL;

-- Delete orphaned operations strictly (since user demanded "OBLIGATOIRE")
DELETE FROM technician_reports WHERE region_id IS NULL OR municipality_id IS NULL OR district_id IS NULL OR neighborhood_id IS NULL;
DELETE FROM infrastructures WHERE region_id IS NULL OR municipality_id IS NULL OR district_id IS NULL OR neighborhood_id IS NULL;
DELETE FROM critical_points WHERE region_id IS NULL OR municipality_id IS NULL OR district_id IS NULL OR neighborhood_id IS NULL;

-- Only set NOT NULL for the strictly operational tables (technician_reports, infrastructures, critical_points)
-- We won't set NOT NULL on `users`, `field_teams` or `missions` because a super_admin user might not belong to a single neighborhood.

ALTER TABLE technician_reports ALTER COLUMN region_id SET NOT NULL;
ALTER TABLE infrastructures ALTER COLUMN region_id SET NOT NULL;
ALTER TABLE critical_points ALTER COLUMN region_id SET NOT NULL;

COMMIT;
