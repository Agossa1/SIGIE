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
    try {
        console.log("Adding municipality_id and district_id to technician_reports table...");
        await pool.query(`
            ALTER TABLE technician_reports 
            ADD COLUMN IF NOT EXISTS municipality_id UUID REFERENCES municipalities(id),
            ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
        `);
        console.log("✅ Columns added successfully!");
    } catch (e) {
        console.error("❌ Error running script:", e);
    } finally {
        await pool.end();
    }
}

run();
