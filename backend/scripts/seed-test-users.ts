/**
 * Script de création des utilisateurs de test — 1 par rôle.
 * 
 * Usage : npm run seed:test-users
 * 
 * Crée 10 utilisateurs (1 par rôle) avec :
 *   - Statut active (vérifié automatiquement)
 *   - Mot de passe : Test123!
 *   - Email : {role}@test.com
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { PasswordService } from '../src/config/passwords/passwordServices';

dotenv.config();

const DB = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hse_terra',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT || 5432),
};

const DEFAULT_PASSWORD = 'Test123!';

interface TestUser {
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    municipalityName?: string;
}

const TEST_USERS: TestUser[] = [
    { role: 'super_admin', email: 'ayemanagossa@gmail.com', firstName: 'Super', lastName: 'Admin', phone: '+22901000000' },
    { role: 'platform_admin', email: 'platform@test.com', firstName: 'Platform', lastName: 'Admin', phone: '+22901000001' },
    { role: 'ministry', email: 'ministry@test.com', firstName: 'Ministère', lastName: 'Cadre de Vie', phone: '+22901000002' },
    { role: 'prefecture', email: 'prefecture@test.com', firstName: 'Préfet', lastName: 'Département', phone: '+22901000003' },
    { role: 'mayor', email: 'mayor@test.com', firstName: 'Maire', lastName: 'Commune', phone: '+22901000004' },
    { role: 'dst_manager', email: 'dst@test.com', firstName: 'DST', lastName: 'Manager', phone: '+22901000005' },
    { role: 'sgds_manager', email: 'sgds@test.com', firstName: 'SGDS', lastName: 'Manager', phone: '+22901000006' },
    { role: 'supervisor', email: 'supervisor@test.com', firstName: 'Superviseur', lastName: 'Zone', phone: '+22901000007' },
    { role: 'team_leader', email: 'teamleader@test.com', firstName: 'Chef', lastName: 'Brigade', phone: '+22901000008' },
    { role: 'technician', email: 'technician@test.com', firstName: 'Agent', lastName: 'Terrain', phone: '+22901000009' },
    { role: 'viewer', email: 'viewer@test.com', firstName: 'Observateur', lastName: 'Externe', phone: '+22901000010' },
];

async function main() {
    console.log('👥 Création des utilisateurs de test...\n');
    const pool = new Pool(DB);
    const client = await pool.connect();
    const pwService = new PasswordService();

    try {
        await client.query('SELECT 1');
        console.log('✅ Connexion OK\n');

        // 1. Vérifier que les rôles existent
        for (const user of TEST_USERS) {
            const roleCode = user.role;
            const existingRole = await client.query('SELECT id FROM roles WHERE code = $1', [roleCode]);
            if (existingRole.rows.length === 0) {
                const roleResult = await client.query(
                    `INSERT INTO roles (id, code, name, description, tier, route_prefix, dashboard_path)
                     VALUES (gen_random_uuid(), $1, $2, $3, 'platform', 'platform', '/admin')
                     ON CONFLICT (code) DO NOTHING
                     RETURNING id`,
                    [roleCode, roleCode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), `Rôle ${roleCode}`]
                );
                if (roleResult.rows.length > 0) {
                    console.log(`   📝 Rôle créé : ${roleCode}`);
                }
            }
        }

        console.log('');

        // 2. Créer chaque utilisateur
        for (const user of TEST_USERS) {
            const now = new Date().toISOString();
            const userId = crypto.randomUUID();

            // Vérifier si l'utilisateur existe déjà
            const existing = await client.query(
                'SELECT id, email, status FROM users WHERE LOWER(email) = LOWER($1)',
                [user.email]
            );

            if (existing.rows.length > 0) {
                const u = existing.rows[0];
                console.log(`   ⚠️  ${user.email} existe déjà (${u.status}) — mise à jour`);

                // Mettre à jour le mot de passe
                const hash = await pwService.hashPassword(DEFAULT_PASSWORD);
                const credExists = await client.query('SELECT 1 FROM credentials WHERE user_id = $1', [u.id]);
                if (credExists.rows.length > 0) {
                    await client.query('UPDATE credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2', [hash, u.id]);
                } else {
                    await client.query(
                        'INSERT INTO credentials (id, user_id, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)',
                        [crypto.randomUUID(), u.id, hash, now]
                    );
                }

                // Statut active
                if (u.status !== 'active') {
                    await client.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2', ['active', u.id]);
                }

                // Assigner le rôle
                const roleRow = await client.query('SELECT id FROM roles WHERE code = $1', [user.role]);
                if (roleRow.rows.length > 0) {
                    const roleId = roleRow.rows[0].id;
                    const hasRole = await client.query('SELECT 1 FROM role_user WHERE user_id = $1 AND role_id = $2', [u.id, roleId]);
                    if (hasRole.rows.length === 0) {
                        await client.query('INSERT INTO role_user (id, user_id, role_id, created_at) VALUES ($1, $2, $3, $4)',
                            [crypto.randomUUID(), u.id, roleId, now]);
                    }
                }

                console.log(`   ✅ ${user.email} → ${user.role} (mis à jour)`);
                continue;
            }

            // Créer l'utilisateur
            const hash = await pwService.hashPassword(DEFAULT_PASSWORD);

            await client.query(
                `INSERT INTO users (id, first_name, last_name, email, phone, type, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, 'admin', 'active', $6, $6)`,
                [userId, user.firstName, user.lastName, user.email, user.phone, now]
            );

            await client.query(
                'INSERT INTO credentials (id, user_id, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)',
                [crypto.randomUUID(), userId, hash, now]
            );

            const roleRow = await client.query('SELECT id FROM roles WHERE code = $1', [user.role]);
            if (roleRow.rows.length > 0) {
                await client.query(
                    'INSERT INTO role_user (id, user_id, role_id, created_at) VALUES ($1, $2, $3, $4)',
                    [crypto.randomUUID(), userId, roleRow.rows[0].id, now]
                );
            }

            await client.query('INSERT INTO user_preferences (id, user_id) VALUES ($1, $2)', [crypto.randomUUID(), userId]);

            await client.query(
                'INSERT INTO user_status_history (id, user_id, new_status, reason, created_at) VALUES ($1, $2, $3, $4, $5)',
                [crypto.randomUUID(), userId, 'active', 'Test user creation', now]
            );

            console.log(`   ✅ ${user.email} → ${user.role} (créé)`);
        }

        console.log(`\n📊 ${TEST_USERS.length} utilisateurs de test prêts !`);
        console.log(`🔑 Mot de passe commun : ${DEFAULT_PASSWORD}\n`);

        console.log('─'.repeat(60));
        console.log('  Email                     | Rôle              | Espace');
        console.log('─'.repeat(60));
        for (const u of TEST_USERS) {
            const space = u.role === 'super_admin' || u.role === 'platform_admin' ? 'Admin Dashboard' :
                          u.role === 'mayor' ? 'Dashboard Communal' :
                          u.role === 'technician' || u.role === 'team_leader' || u.role === 'supervisor' ? 'Terrain / Field Ops' :
                          'Dashboard Territorial';
            console.log(`  ${u.email.padEnd(26)}| ${u.role.padEnd(18)}| ${space}`);
        }
        console.log('─'.repeat(60));

    } catch (e: any) {
        console.error('❌ Erreur :', e.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();