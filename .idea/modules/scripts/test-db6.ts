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
        const d = await pool.query(`SELECT DISTINCT department FROM municipalities`);
        console.log("Departments in DB:", d.rows.map(r => r.department));
        
        const m = await pool.query(`SELECT count(*) FROM municipalities WHERE name ILIKE 'Banikoara'`);
        console.log("Banikoara count:", m.rows[0].count);
    } finally {
        await pool.end();
    }
}
run();
