import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: 'apps/backend/.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'HSE',
    password: process.env.DB_PASSWORD || '19991',
    database: process.env.DB_NAME || 'hsetera',
});

const roles = [
    { code: 'super_admin', name: 'super_admin', description: 'Super Administrateur' },
    { code: 'platform_admin', name: 'platform_admin', description: 'Administrateur de Plateforme' },
    { code: 'ministry', name: 'ministry', description: 'Ministère' },
    { code: 'prefecture_director', name: 'prefecture_director', description: 'Directeur Préfectoral / Départemental' },
    { code: 'mayor', name: 'mayor', description: 'Maire' },
    { code: 'dst_manager', name: 'dst_manager', description: 'Directeur des Services Techniques' },
    { code: 'sgds_manager', name: 'sgds_manager', description: 'Manager SGDS' },
    { code: 'supervisor', name: 'supervisor', description: 'Superviseur' },
    { code: 'team_leader', name: 'team_leader', description: 'Chef d\'Équipe' },
    { code: 'technician', name: 'technician', description: 'Technicien / Agent' },
    { code: 'viewer', name: 'viewer', description: 'Consultant / Visualiseur' },
];

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('--- SYNCING ROLES ---');

        for (const role of roles) {
            await client.query(`
                INSERT INTO roles (id, code, name, description)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (code) DO NOTHING
            `, [crypto.randomUUID(), role.code, role.name, role.description]);
        }
        
        // Remove the ones that are conflicting in French if needed, or leave them.
        
        await client.query('COMMIT');
        console.log('Roles successfully synced!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error syncing roles:', e);
    } finally {
        client.release();
        await pool.end();
    }
}
run();
