-- ============================================================================
-- SIGIE — MIGRATION 05 : NOTIFICATIONS
-- Phase 5 — Notifications & SLA
-- ============================================================================

-- Nettoyer l'ancienne table partiellement créée (si elle existe)
DROP TABLE IF EXISTS notifications CASCADE;

BEGIN;

-- Table des notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,          -- 'status_change', 'sla_alert', 'assignment', 'validation', 'system'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',            -- payload: { reportId, missionId, status, ... }
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la récupération rapide par utilisateur
CREATE INDEX idx_notifications_user_read 
    ON notifications(user_id, is_read, created_at DESC);

-- Préférences de notification utilisateur
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    status_change_enabled BOOLEAN DEFAULT TRUE,
    sla_alert_enabled BOOLEAN DEFAULT TRUE,
    assignment_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de suivi SLA
CREATE TABLE IF NOT EXISTS sla_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES technician_reports(id) ON DELETE CASCADE,
    sla_hours INT NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    violated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Met à jour deadline et violated à chaque insertion/mise à jour (trigger simplifié)
-- Note: les colonnes sont calculées au moment de l'insertion par le backend

COMMIT;