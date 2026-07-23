-- 03_report_transfers.sql
-- Migration pour la Phase 1 : Transfert de Signalements et Propriété Dynamique

-- 1. Ajouter la colonne current_owner_role aux signalements
ALTER TABLE technician_reports ADD COLUMN current_owner_role VARCHAR(50) DEFAULT NULL;

-- 2. Créer la table de traçabilité des transferts
CREATE TABLE IF NOT EXISTS report_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_report_id UUID NOT NULL REFERENCES technician_reports(id) ON DELETE CASCADE,
    from_role VARCHAR(50) NOT NULL,
    to_role VARCHAR(50) NOT NULL,
    transferred_by UUID REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour retrouver facilement les transferts d'un signalement
CREATE INDEX idx_report_transfers_technician_report_id ON report_transfers(technician_report_id);
