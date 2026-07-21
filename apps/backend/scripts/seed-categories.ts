import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const DB = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hse_terra',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT || 5432),
};

const CATEGORIES = [
    { code: 'drainage', label: 'Drainage', icon: '💧', color: '#059669', description: 'Caniveaux bouchés, obstructions, écoulement' },
    { code: 'waste', label: 'Déchets', icon: '🗑️', color: '#6b7280', description: 'Dépôts sauvages, collecte, insalubrité' },
    { code: 'road', label: 'Voirie', icon: '🛣️', color: '#059669', description: 'Nids-de-poule, dégradation, sécurité routière' },
    { code: 'lighting', label: 'Éclairage', icon: '💡', color: '#6b7280', description: 'Lampadaires défaillants, zones non éclairées' },
    { code: 'flooding', label: 'Inondation', icon: '🌊', color: '#059669', description: 'Zones inondées, risques hydrologiques' },
    { code: 'biodiversity', label: 'Biodiversité', icon: '🌿', color: '#047857', description: 'Faune, flore, espèces protégées' },
    { code: 'air_quality', label: 'Qualité Air', icon: '🌬️', color: '#6b7280', description: 'Pollution atmosphérique, capteurs' },
    { code: 'water_quality', label: 'Qualité Eau', icon: '🧪', color: '#059669', description: 'Pollution aquatique, pH, turbidité' },
    { code: 'other', label: 'Autre', icon: '📋', color: '#9ca3af', description: 'Tout autre type de signalement' },
];

async function main() {
    const pool = new Pool(DB);
    const client = await pool.connect();
    try {
        await client.query('SELECT 1');
        console.log('✅ Connexion OK\n');

        // Créer la table si elle n'existe pas
        await client.query(`
            CREATE TABLE IF NOT EXISTS report_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code VARCHAR(50) UNIQUE NOT NULL,
                label VARCHAR(100) NOT NULL,
                icon VARCHAR(10),
                color VARCHAR(7) DEFAULT '#6b7280',
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Upsert chaque catégorie
        for (const cat of CATEGORIES) {
            await client.query(`
                INSERT INTO report_categories (code, label, icon, color, description, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (code) DO UPDATE SET
                    label = EXCLUDED.label,
                    icon = EXCLUDED.icon,
                    color = EXCLUDED.color,
                    description = EXCLUDED.description,
                    sort_order = EXCLUDED.sort_order
            `, [cat.code, cat.label, cat.icon, cat.color, cat.description, CATEGORIES.indexOf(cat)]);
        }

        const { rows } = await client.query('SELECT code, label FROM report_categories ORDER BY sort_order');
        console.log(`✅ ${rows.length} catégories seedées :`);
        rows.forEach((r: any) => console.log(`   ${r.code} → ${r.label}`));

    } catch (e: any) { console.error('❌', e.message); }
    finally { client.release(); await pool.end(); }
}

main();