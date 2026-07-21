/**
 * Script de création du Super Admin — compte vérifié automatiquement.
 * 
 * Usage :
 *   npx ts-node scripts/seed-superadmin.ts
 * 
 * Crée l'utilisateur ayemanagossa@gmail.com avec :
 *   - Rôle super_admin
 *   - Statut active (vérifié automatiquement)
 *   - Mot de passe : changeme123 (à changer après première connexion)
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

const SUPER_ADMIN = {
    email: 'ayemanagossa@gmail.com',
    firstName: 'Super',
    lastName: 'Admin',
    password: 'changeme123',
    phone: '+22900000000',
};

async function main() {
    console.log('🚀 Création du Super Admin...\n');
    const pool = new Pool(DB);
    const client = await pool.connect();

    try {
        await client.query('SELECT 1');
        console.log('✅ Connexion OK\n');

        // 1. Vérifier si l'utilisateur existe déjà
        const existing = await client.query(
            'SELECT id, email, status FROM users WHERE LOWER(email) = LOWER($1)',
            [SUPER_ADMIN.email]
        );

        if (existing.rows.length > 0) {
            const u = existing.rows[0];
            console.log(`⚠️  Utilisateur déjà existant : ${u.email} (status: ${u.status})`);

            // Recalculer le hash du mot de passe (avec pepper)
            const pwService = new PasswordService();
            const newHash = await pwService.hashPassword(SUPER_ADMIN.password);
            await client.query(
                `UPDATE credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`,
                [newHash, u.id]
            );
            console.log('✅ Mot de passe mis à jour (avec pepper)');

            // Mettre à jour le statut à active si besoin
            if (u.status !== 'active') {
                await client.query(`UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`, [u.id]);
                console.log('✅ Statut mis à jour → active');
            }

            // Vérifier le rôle super_admin
            const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', ['super_admin']);
            const roleId = roleResult.rows[0]?.id;
            if (roleId) {
                const hasRole = await client.query(
                    'SELECT 1 FROM role_user WHERE user_id = $1 AND role_id = $2',
                    [u.id, roleId]
                );
                if (hasRole.rows.length === 0) {
                    await client.query('INSERT INTO role_user (user_id, role_id) VALUES ($1, $2)', [u.id, roleId]);
                    console.log('✅ Rôle super_admin attribué');
                } else {
                    console.log('ℹ️  Rôle super_admin déjà attribué');
                }
            }
        } else {
            // 2. Vérifier que le rôle super_admin existe
            const roleResult = await client.query('SELECT id FROM roles WHERE code = $1', ['super_admin']);
            if (roleResult.rows.length === 0) {
                console.log('📝 Création du rôle super_admin...');
                const insertRole = await client.query(
                    `INSERT INTO roles (id, code, name, description, tier, route_prefix, dashboard_path, page_ids, can_manage_users, can_manage_roles)
                     VALUES (gen_random_uuid(), 'super_admin', 'Super administrateur', 'Accès complet à la plateforme', 'platform', 'platform', '/admin', '{"dashboard","fieldOps","agentReports","interventions","teamsGps","gisMap","infrastructure","roads","sanitation","alerts","users","organizations","roles","access","auditLog"}', TRUE, TRUE)
                     RETURNING id`
                );
                const roleId = insertRole.rows[0].id;
                console.log(`✅ Rôle super_admin créé (id: ${roleId})`);
            }

            // 3. Créer l'utilisateur
            const userId = crypto.randomUUID();
            const now = new Date().toISOString();
            const pwService = new PasswordService();
            const passwordHash = await pwService.hashPassword(SUPER_ADMIN.password);

            await client.query('BEGIN');

            await client.query(
                `INSERT INTO users (id, first_name, last_name, email, phone, type, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, 'admin', 'active', $6, $6)`,
                [userId, SUPER_ADMIN.firstName, SUPER_ADMIN.lastName, SUPER_ADMIN.email, SUPER_ADMIN.phone, now]
            );

            await client.query(
                `INSERT INTO credentials (id, user_id, password_hash, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $4)`,
                [crypto.randomUUID(), userId, passwordHash, now]
            );

            const roleId = (await client.query('SELECT id FROM roles WHERE code = $1', ['super_admin'])).rows[0].id;
            await client.query(
                `INSERT INTO role_user (id, user_id, role_id, created_at) VALUES ($1, $2, $3, $4)`,
                [crypto.randomUUID(), userId, roleId, now]
            );

            await client.query(`INSERT INTO user_preferences (id, user_id) VALUES ($1, $2)`, [crypto.randomUUID(), userId]);

            await client.query(
                `INSERT INTO user_status_history (id, user_id, new_status, reason, created_at)
                 VALUES ($1, $2, 'active', 'Super admin account creation', $3)`,
                [crypto.randomUUID(), userId, now]
            );

            await client.query('COMMIT');

            console.log(`✅ Super Admin créé avec succès !`);
        }

        console.log(`\n📧 Email    : ${SUPER_ADMIN.email}`);
        console.log(`🔑 Password : ${SUPER_ADMIN.password}`);
        console.log(`👤 Rôle     : super_admin`);
        console.log(`🟢 Statut   : active (vérifié)`);
        console.log(`\n⚠️  CHANGEZ CE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !\n`);

    } catch (error: any) {
        console.error('❌ Erreur :', error.message);
        try { await client.query('ROLLBACK'); } catch {}
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();