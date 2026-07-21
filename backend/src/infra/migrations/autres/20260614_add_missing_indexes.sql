-- Migration: Add missing indexes for performance
-- Ces index accélèrent les JOIN dans getReports() et getReportById()

BEGIN;

-- Index sur les FK de technician_reports
CREATE INDEX IF NOT EXISTS idx_technician_reports_neighborhood_id ON technician_reports(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_technician_reports_district_id ON technician_reports(district_id);
CREATE INDEX IF NOT EXISTS idx_technician_reports_municipality_id ON technician_reports(municipality_id);
CREATE INDEX IF NOT EXISTS idx_technician_reports_region_id ON technician_reports(region_id);
CREATE INDEX IF NOT EXISTS idx_technician_reports_created_by ON technician_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_technician_reports_deleted_at ON technician_reports(deleted_at);
CREATE INDEX IF NOT EXISTS idx_technician_reports_status ON technician_reports(status);
CREATE INDEX IF NOT EXISTS idx_technician_reports_created_at ON technician_reports(created_at DESC);

-- Index sur les FK des tables géographiques
CREATE INDEX IF NOT EXISTS idx_districts_municipality_id ON districts(municipality_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_district_id ON neighborhoods(district_id);
CREATE INDEX IF NOT EXISTS idx_municipalities_region_id ON municipalities(region_id);

-- Index sur les FK de users
CREATE INDEX IF NOT EXISTS idx_users_municipality_id ON users(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_district_id ON users(district_id);
CREATE INDEX IF NOT EXISTS idx_users_region_id ON users(region_id);

COMMIT;
