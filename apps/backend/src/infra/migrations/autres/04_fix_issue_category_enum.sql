-- Migration pour corriger l'énumération issue_category_enum
-- Ajout des valeurs manquantes si elles n'existent pas déjà

-- PostgreSQL ne permet pas d'ajouter des valeurs à un ENUM à l'intérieur d'un bloc de transaction (BEGIN/COMMIT)
-- Mais le script de migration utilise BEGIN/COMMIT. 
-- Une alternative est d'utiliser DO $$ ... $$ mais ALTER TYPE ... ADD VALUE ne peut pas non plus être exécuté dans un bloc DO.

-- Cependant, le script de migration attrape les erreurs.
-- On va tenter l'ajout direct. Si le script échoue, on avisera.

ALTER TYPE issue_category_enum ADD VALUE IF NOT EXISTS 'biodiversity';
ALTER TYPE issue_category_enum ADD VALUE IF NOT EXISTS 'air_quality';
ALTER TYPE issue_category_enum ADD VALUE IF NOT EXISTS 'water_quality';
