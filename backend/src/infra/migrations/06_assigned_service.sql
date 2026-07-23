-- ============================================================================
-- SIGIE — MIGRATION 06 : CHAMP assigned_service SUR missions
-- Phase 7 — Flux SGDS/DST Simplifié
-- ============================================================================
ALTER TABLE missions ADD COLUMN IF NOT EXISTS assigned_service VARCHAR(10);