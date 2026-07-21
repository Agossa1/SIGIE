-- Migration to add intervention_logs

CREATE TYPE intervention_log_type AS ENUM ('status_change', 'note', 'blocker', 'photo_added');

CREATE TABLE IF NOT EXISTS intervention_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    log_type intervention_log_type NOT NULL,
    old_status field_assignment_status_enum,
    new_status field_assignment_status_enum,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intervention_logs_intervention_id ON intervention_logs(intervention_id);
CREATE INDEX idx_intervention_logs_created_at ON intervention_logs(created_at);
