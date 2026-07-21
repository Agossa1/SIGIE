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
        await pool.query(`DELETE FROM municipalities WHERE code LIKE 'BJ%'`);
        console.log("Deleted remaining dummy municipalities.");
    } finally {
        await pool.end();
    }
}
run();
