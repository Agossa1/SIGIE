-- ============================================================================
-- SIGIE — MIGRATION 04 : EXTENSION DES STATUTS POUR LE PIPELINE COMPLET
-- Phase 0.3 — Quick Wins
-- 
-- ⚠️ Les ALTER TYPE doivent être exécutés dans une transaction séparée
--    car PostgreSQL interdit d'utiliser les nouvelles valeurs dans la même tx.
-- ============================================================================

-- ============================================================================
-- TRANSACTION 1 : Ajout des nouveaux statuts aux enums
-- ============================================================================
ALTER TYPE field_report_status_enum ADD VALUE IF NOT EXISTS 'needs_revision';
ALTER TYPE field_report_status_enum ADD VALUE IF NOT EXISTS 'validated_by_team';
ALTER TYPE field_report_status_enum ADD VALUE IF NOT EXISTS 'pending_dst';
ALTER TYPE field_report_status_enum ADD VALUE IF NOT EXISTS 'pending_sgds';

ALTER TYPE mission_status_enum ADD VALUE IF NOT EXISTS 'validated_by_supervisor';
ALTER TYPE mission_status_enum ADD VALUE IF NOT EXISTS 'needs_rework';

-- ============================================================================
-- TRANSACTION 2 : Colonnes + index
-- ============================================================================
BEGIN;

-- 1. Colonnes de recommandation superviseur sur technician_reports
ALTER TABLE technician_reports
    ADD COLUMN IF NOT EXISTS supervisor_recommendation TEXT,
    ADD COLUMN IF NOT EXISTS suggested_mission_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS suggested_priority VARCHAR(20),
    ADD COLUMN IF NOT EXISTS estimated_budget NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS regrouped_report_ids UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS urgent_flag BOOLEAN DEFAULT FALSE;

-- 2. Colonnes de clôture sur missions
ALTER TABLE missions
    ADD COLUMN IF NOT EXISTS estimated_budget NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS actual_cost NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS closure_note TEXT,
    ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 3. Index simple pour le lien report_id
CREATE INDEX IF NOT EXISTS idx_missions_report_id ON missions(report_id) WHERE report_id IS NOT NULL;

COMMIT;