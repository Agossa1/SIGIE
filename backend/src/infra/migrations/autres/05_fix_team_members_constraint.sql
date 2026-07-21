-- Migration pour ajouter une contrainte d'unicité sur team_members
-- Nécessaire pour l'opération ON CONFLICT (team_id, user_id) DO UPDATE

ALTER TABLE team_members ADD CONSTRAINT unique_team_user UNIQUE (team_id, user_id);
