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
        const d = await pool.query(`
            SELECT m.name as m_name, d.name as d_name
            FROM districts d
            JOIN municipalities m ON d.municipality_id = m.id
            LIMIT 5
        `);
        console.log("Sample districts and their municipalities:", d.rows);
        
        const b = await pool.query(`SELECT * FROM municipalities WHERE name ILIKE '%Banikoara%'`);
        console.log("Banikoara municipalities:", b.rows.map(r => ({ id: r.id, name: r.name, code: r.code })));
        
        const d_ban = await pool.query(`SELECT * FROM districts WHERE municipality_id IN (SELECT id FROM municipalities WHERE name ILIKE '%Banikoara%')`);
        console.log("Districts for any Banikoara municipality:", d_ban.rows.length);

        const d_all_ban = await pool.query(`SELECT * FROM districts WHERE name ILIKE '%Banikoara%' OR code LIKE 'BJ%' LIMIT 5`);
        console.log("Sample districts:", d_all_ban.rows.map(r => ({ id: r.id, name: r.name, code: r.code, mun_id: r.municipality_id })));
    } finally {
        await pool.end();
    }
}
run();
