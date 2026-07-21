-- Migration: Lier les modules Reports → Missions → Interventions
-- Phase 1 du plan de transformation en outils de gestion de projet

-- ═══════════════════════════════════════════════════════
-- 1. MISSIONS : Ajouter les champs manquants
-- ═══════════════════════════════════════════════════════

-- Lien vers le signalement d'origine
ALTER TABLE missions
  ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES technician_reports(id) ON DELETE SET NULL;

-- Deadlines & suivi temps
ALTER TABLE missions
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(6,2);

-- ═══════════════════════════════════════════════════════
-- 2. INTERVENTIONS : Ajouter l'agent responsable
-- ═══════════════════════════════════════════════════════

ALTER TABLE interventions
  ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vehicle_notes TEXT,
  ADD COLUMN IF NOT EXISTS equipment_notes TEXT;

-- ═══════════════════════════════════════════════════════
-- 3. TECHNICIAN_REPORTS : Ajouter l'agent assigné + SLA
-- ═══════════════════════════════════════════════════════

ALTER TABLE technician_reports
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_hours INT DEFAULT 48;

-- ═══════════════════════════════════════════════════════
-- 4. CHECKLIST DES MISSIONS (sous-tâches)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mission_checklist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  done_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  done_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "order"     INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_mission_checklist_mission ON mission_checklist(mission_id);

-- ═══════════════════════════════════════════════════════
-- 5. COMMENTAIRES SUR LES SIGNALEMENTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS report_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES technician_reports(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_report_comments_report ON report_comments(report_id);

-- ═══════════════════════════════════════════════════════
-- 6. INDEX DE PERFORMANCE SUPPLÉMENTAIRES
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_missions_report_id ON missions(report_id);
CREATE INDEX IF NOT EXISTS idx_missions_due_date ON missions(due_date);
CREATE INDEX IF NOT EXISTS idx_interventions_assigned_user ON interventions(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_assigned_to ON technician_reports(assigned_to);
