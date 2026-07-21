import { Pool } from 'pg';
import dotenv from 'dotenv';
import { PasswordService } from '../src/config/passwords/passwordServices';

dotenv.config();

const DB = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'smart_city',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT || 5432),
};

async function main() {
    const pool = new Pool(DB);
    const client = await pool.connect();

    try {
        const pepper = process.env.PASSWORD_PEPPER ? '(défini)' : '(Vide ⚠️)';
        console.log(`🔑 Pepper : ${pepper}`);
        
        // Trouver l'utilisateur
        const user = await client.query(
            `SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)`, ['ayemanagossa@gmail.com']
        );
        if (user.rows.length === 0) {
            console.log('❌ Utilisateur non trouvé. Lance "npm run seed:superadmin" d\'abord.');
            return;
        }
        const uid = user.rows[0].id;

        // Générer le bon hash avec pepper
        const pw = new PasswordService();
        const hash = await pw.hashPassword('changeme123');
        console.log(`Hash généré : ${hash.substring(0, 30)}...`);

        // Mettre à jour
        await client.query(`UPDATE credentials SET password_hash = $1, updated_at = NOW() WHERE user_id = $2`, [hash, uid]);
        console.log(`✅ Mot de passe mis à jour pour ${user.rows[0].email}`);

        // Vérifier le statut
        await client.query(`UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1`, [uid]);
        console.log('✅ Statut → active');

        console.log('\n📧 Email    : ayemanagossa@gmail.com');
        console.log('🔑 Password : changeme123');
        console.log('🟢 Statut   : active\n');

    } catch (e: any) { console.error(e.message); }
    finally { client.release(); await pool.end(); }
}

main();