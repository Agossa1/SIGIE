-- Table pour la gestion des fichiers multimédias

-- On nettoie pour éviter les conflits de schéma en développement
DROP TABLE IF EXISTS media CASCADE;
DROP TYPE IF EXISTS media_type;

CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- URL ou chemin relatif S3/Stockage
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL, -- En octets
    type media_type NOT NULL DEFAULT 'image',
    
    -- Polymorphisme simple pour lier à n'importe quelle entité
    related_id UUID NOT NULL, -- ID du rapport, de l'utilisateur, etc.
    related_type VARCHAR(50) NOT NULL, -- 'technician_report', 'profile', etc.
    
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélérer la récupération des médias d'un rapport
CREATE INDEX idx_media_related ON media(related_id, related_type);
CREATE INDEX idx_media_uploader ON media(uploader_id);