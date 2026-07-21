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
        const oldMuns = await pool.query(`SELECT id, name FROM municipalities WHERE code LIKE 'BJ%'`);
        console.log(`Found ${oldMuns.rowCount} old municipalities.`);
        
        let updatedUsers = 0;
        for (const old of oldMuns.rows) {
            // Find the new one
            const newMun = await pool.query(`SELECT id FROM municipalities WHERE UPPER(name) = UPPER($1) AND code NOT LIKE 'BJ%'`, [old.name]);
            if ((newMun.rowCount || 0) > 0) {
                const newId = newMun.rows[0].id;
                // update users
                const upd = await pool.query(`UPDATE users SET municipality_id = $1 WHERE municipality_id = $2`, [newId, old.id]);
                updatedUsers += (upd.rowCount || 0);
                // update technician_reports just in case
                await pool.query(`UPDATE technician_reports SET municipality_id = $1 WHERE municipality_id = $2`, [newId, old.id]);
                // delete old
                await pool.query(`DELETE FROM municipalities WHERE id = $1`, [old.id]);
            } else {
                console.log("No new municipality found for", old.name);
            }
        }
        console.log(`Updated ${updatedUsers} users and deleted old municipalities.`);
    } finally {
        await pool.end();
    }
}
run();
