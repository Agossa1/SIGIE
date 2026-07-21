import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

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
        console.log('--- TESTING CONNECTION ---');
        const dbName = await client.query('SELECT current_database()');
        console.log('Connected to:', dbName.rows[0].current_database);

        const orgs = await client.query('SELECT id, name, code FROM organizations');
        console.log('--- ORGANIZATIONS ---');
        console.log(orgs.rows);

        const users = await client.query(`
            SELECT u.id, u.email, u.municipality_id, array_agg(r.name) as roles
            FROM users u
            LEFT JOIN role_user ru ON u.id = ru.user_id
            LEFT JOIN roles r ON ru.role_id = r.id
            GROUP BY u.id
        `);
        console.log('--- USERS ---');
        console.log(users.rows);

        const mun = await client.query('SELECT count(*), department FROM municipalities GROUP BY department');
        console.log('--- MUNICIPALITIES ---');
        console.log(mun.rows);

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}
run();
