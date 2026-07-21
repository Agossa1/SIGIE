import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.POSTGRES_DB || 'work_job',
});

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('--- SEEDING ROLES AND TEST USERS ---');

        // 1. Insérer les rôles
        // 1. Insérer les rôles (alignés sur le frontend)
        const roles = [
            { code: 'super_admin', name: 'super_admin', description: 'Administrateur suprême de la plateforme' },
            { code: 'platform_admin', name: 'platform_admin', description: 'Administrateur de la plateforme' },
            { code: 'ministry', name: 'ministry', description: 'Ministère du Cadre de Vie' },
            { code: 'prefecture_director', name: 'prefecture_director', description: 'Directeur Départemental / Préfectoral' },
            { code: 'mayor', name: 'mayor', description: 'Maire d\'une commune' },
            { code: 'dst_manager', name: 'dst_manager', description: 'Responsable DST' },
            { code: 'sgds_manager', name: 'sgds_manager', description: 'Responsable SGDS' },
            { code: 'supervisor', name: 'supervisor', description: 'Superviseur de zone' },
            { code: 'team_leader', name: 'team_leader', description: 'Chef de brigade' },
            { code: 'technician', name: 'technician', description: 'Technicien terrain' }
        ];

        for (const role of roles) {
            await client.query(`
                INSERT INTO roles (id, code, name, description)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (code) DO NOTHING
            `, [crypto.randomUUID(), role.code, role.name, role.description]);
        }
        console.log('Roles seeded.');

        // 2. Récupérer les identifiants territoriaux
        const orgRes = await client.query("SELECT id FROM organizations WHERE code = 'org-default' LIMIT 1");
        if (orgRes.rows.length === 0) {
            throw new Error("No organization found. Please run seed-benin.ts first.");
        }
        const organizationId = orgRes.rows[0].id;

        // Cotonou
        const cotonouRes = await client.query("SELECT id FROM municipalities WHERE LOWER(name) = 'cotonou' LIMIT 1");
        if (cotonouRes.rows.length === 0) {
            throw new Error("Cotonou municipality not found. Please run seed-benin.ts and import-boundaries.ts first.");
        }
        const cotonouId = cotonouRes.rows[0].id;

        // Arrondissement de Godomey
        const godomeyRes = await client.query("SELECT id FROM districts WHERE LOWER(name) LIKE '%godomey%' LIMIT 1");
        if (godomeyRes.rows.length === 0) {
            throw new Error("Godomey district not found. Please run seed-benin.ts first.");
        }
        const godomeyId = godomeyRes.rows[0].id;

        const pepper = process.env.PASSWORD_PEPPER || "";
        const passwordHash = await bcrypt.hash('password123' + pepper, 12);

        // Définir les utilisateurs à créer/mettre à jour
        const testUsers = [
            {
                email: 'superadmin@gouv.bj',
                firstName: 'Super',
                lastName: 'Admin',
                role: 'super_admin',
                municipalityId: null,
                districtId: null,
                department: null
            },
            {
                email: 'ayemanagossa@gmail.com',
                firstName: 'Aye',
                lastName: 'Managossa',
                role: 'super_admin',
                municipalityId: null,
                districtId: null,
                department: null
            },
            {
                email: 'maire.cotonou@gouv.bj',
                firstName: 'Luc',
                lastName: 'Atrokpo',
                role: 'mayor',
                municipalityId: cotonouId,
                districtId: null,
                department: 'Littoral'
            },
            {
                email: 'directeur.atlantique@gouv.bj',
                firstName: 'Jean',
                lastName: 'Directeur',
                role: 'prefecture_director',
                municipalityId: null,
                districtId: null,
                department: 'Atlantique'
            },
            {
                email: 'cd.godomey@gouv.bj',
                firstName: 'Marc',
                lastName: 'Chef',
                role: 'supervisor',
                municipalityId: null,
                districtId: godomeyId,
                department: 'Atlantique'
            }
        ];

        for (const user of testUsers) {
            console.log(`Setting up user: ${user.email} with role ${user.role}...`);
            
            // Supprimer d'abord si déjà existant pour éviter les conflits et écraser proprement
            await client.query("DELETE FROM users WHERE email = $1", [user.email]);

            const userId = crypto.randomUUID();
            await client.query(`
                INSERT INTO users (id, organization_id, municipality_id, district_id, department, first_name, last_name, email, type, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'user', 'active')
            `, [userId, organizationId, user.municipalityId, user.districtId, user.department, user.firstName, user.lastName, user.email]);

            // Credentials
            await client.query(`
                INSERT INTO credentials (id, user_id, password_hash)
                VALUES ($1, $2, $3)
            `, [crypto.randomUUID(), userId, passwordHash]);

            // Récupérer le role ID
            const roleRes = await client.query("SELECT id FROM roles WHERE code = $1", [user.role]);
            const roleId = roleRes.rows[0].id;

            // Associer le rôle
            await client.query(`
                INSERT INTO role_user (user_id, role_id)
                VALUES ($1, $2)
            `, [userId, roleId]);

            // Préférences
            await client.query(`
                INSERT INTO user_preferences (user_id)
                VALUES ($1)
            `, [userId]);
        }

        await client.query('COMMIT');
        console.log('Test users successfully seeded!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding test users:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
