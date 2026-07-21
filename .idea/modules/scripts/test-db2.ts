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
        const m = await pool.query(`SELECT * FROM municipalities WHERE department = 'Alibori'`);
        console.log("Municipalities in Alibori:", m.rows.map(r => ({ name: r.name, code: r.code })));
    } finally {
        await pool.end();
    }
}
run();
