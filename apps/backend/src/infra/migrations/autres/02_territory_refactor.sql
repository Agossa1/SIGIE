-- Migration 02: Refactoring Territorial

BEGIN;

-- 1. Create the departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    geometry GEOMETRY(MULTIPOLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Populate departments from existing municipalities if any, or just insert the 12 departments of Benin
INSERT INTO departments (name)
VALUES 
    ('Alibori'), ('Atacora'), ('Atlantique'), ('Borgou'), 
    ('Collines'), ('Couffo'), ('Donga'), ('Littoral'), 
    ('Mono'), ('Ouémé'), ('Plateau'), ('Zou')
ON CONFLICT (name) DO NOTHING;

-- 3. Add department_id to municipalities
ALTER TABLE municipalities ADD COLUMN department_id UUID REFERENCES departments(id);

-- Update municipalities with correct department_id based on their text department
UPDATE municipalities m
SET department_id = d.id
FROM departments d
WHERE LOWER(m.department) = LOWER(d.name);

-- 4. Add territorial columns to users
ALTER TABLE users ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE users ADD COLUMN neighborhood_id UUID REFERENCES neighborhoods(id);

-- 5. Add territorial columns to technician_reports
ALTER TABLE technician_reports ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE technician_reports ADD COLUMN municipality_id UUID REFERENCES municipalities(id);
ALTER TABLE technician_reports ADD COLUMN district_id UUID REFERENCES districts(id);

-- We assume existing data in technician_reports might not have geometry or neighborhood_id.
-- If they have location, we do a spatial update.
UPDATE technician_reports tr
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    department_id = m.department_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Contains(n.geometry, tr.location) AND tr.location IS NOT NULL;

-- Delete rows without valid territory (as requested: "CA DOIT ETRE OBILIGATOIRES")
DELETE FROM technician_reports WHERE department_id IS NULL OR municipality_id IS NULL OR neighborhood_id IS NULL;

-- Enforce NOT NULL on technician_reports
ALTER TABLE technician_reports ALTER COLUMN department_id SET NOT NULL;
ALTER TABLE technician_reports ALTER COLUMN municipality_id SET NOT NULL;
ALTER TABLE technician_reports ALTER COLUMN district_id SET NOT NULL;
ALTER TABLE technician_reports ALTER COLUMN neighborhood_id SET NOT NULL;

-- Do the same for infrastructures
ALTER TABLE infrastructures ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE infrastructures ADD COLUMN district_id UUID REFERENCES districts(id);
ALTER TABLE infrastructures ADD COLUMN neighborhood_id UUID REFERENCES neighborhoods(id);

UPDATE infrastructures i
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    department_id = m.department_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Contains(n.geometry, ST_Centroid(i.geometry)) AND i.geometry IS NOT NULL;

DELETE FROM infrastructures WHERE department_id IS NULL OR municipality_id IS NULL OR neighborhood_id IS NULL;

ALTER TABLE infrastructures ALTER COLUMN department_id SET NOT NULL;
ALTER TABLE infrastructures ALTER COLUMN municipality_id SET NOT NULL;
ALTER TABLE infrastructures ALTER COLUMN district_id SET NOT NULL;
ALTER TABLE infrastructures ALTER COLUMN neighborhood_id SET NOT NULL;

-- Same for critical_points
ALTER TABLE critical_points ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE critical_points ADD COLUMN district_id UUID REFERENCES districts(id);
ALTER TABLE critical_points ADD COLUMN neighborhood_id UUID REFERENCES neighborhoods(id);

UPDATE critical_points cp
SET 
    neighborhood_id = n.id,
    district_id = n.district_id,
    municipality_id = d.municipality_id,
    department_id = m.department_id
FROM neighborhoods n
JOIN districts d ON n.district_id = d.id
JOIN municipalities m ON d.municipality_id = m.id
WHERE ST_Contains(n.geometry, cp.location) AND cp.location IS NOT NULL;

DELETE FROM critical_points WHERE department_id IS NULL OR municipality_id IS NULL OR neighborhood_id IS NULL;

ALTER TABLE critical_points ALTER COLUMN department_id SET NOT NULL;
ALTER TABLE critical_points ALTER COLUMN municipality_id SET NOT NULL;
ALTER TABLE critical_points ALTER COLUMN district_id SET NOT NULL;
ALTER TABLE critical_points ALTER COLUMN neighborhood_id SET NOT NULL;

COMMIT;
