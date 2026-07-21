import { Pool } from 'pg';
import * as dotenv from 'dotenv';

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
        console.log('--- ALTERING USERS TABLE ---');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS department VARCHAR(255);
        `);
        console.log('Success! district_id and department columns added to users table.');
    } catch (e) {
        console.error('Error altering users table:', e);
    } finally {
        client.release();
        await pool.end();
    }
}
run();
