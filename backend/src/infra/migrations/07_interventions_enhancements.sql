-- Add priority to interventions
ALTER TABLE interventions 
ADD COLUMN IF NOT EXISTS priority priority_level_enum DEFAULT 'medium';

-- Add photos_before and photos_after to field_intervention_reports
ALTER TABLE field_intervention_reports 
ADD COLUMN IF NOT EXISTS photos_before TEXT[],
ADD COLUMN IF NOT EXISTS photos_after TEXT[];
