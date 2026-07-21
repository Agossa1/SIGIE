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
        // Simulate what selectMunicipalitiesByRegion does
        const regions = await pool.query(`SELECT id, name FROM regions ORDER BY name LIMIT 5`);
        console.log("Sample regions:", regions.rows);

        const firstRegion = regions.rows[0];
        if (firstRegion) {
            const muns = await pool.query(`
                SELECT m.id, m.name, m.region_id as "regionId"
                FROM municipalities m
                WHERE m.region_id = $1
                ORDER BY m.name LIMIT 5
            `, [firstRegion.id]);
            console.log(`Municipalities for region "${firstRegion.name}":`, muns.rows);
        }
        
        // Check if municipalities have region_id
        const sample = await pool.query(`SELECT id, name, region_id FROM municipalities LIMIT 5`);
        console.log("Sample municipalities with region_id:", sample.rows);
    } finally {
        await pool.end();
    }
}
run();
