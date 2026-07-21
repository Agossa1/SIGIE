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
        // Get all regions
        const regions = await pool.query(`SELECT id, name FROM regions`);
        console.log("Regions found:", regions.rows.map((r: any) => r.name));

        let updatedTotal = 0;
        for (const region of regions.rows as Array<{id: string, name: string}>) {
            // Match municipalities by department name (case-insensitive)
            const result = await pool.query(
                `UPDATE municipalities 
                 SET region_id = $1 
                 WHERE UPPER(department) = UPPER($2) AND region_id IS NULL`,
                [region.id, region.name]
            );
            const count = result.rowCount || 0;
            if (count > 0) {
                console.log(`  ✅ Linked ${count} municipalities to region "${region.name}"`);
                updatedTotal += count;
            }
        }
        console.log(`\nTotal: ${updatedTotal} municipalities linked to regions.`);

        // Verify
        const nullCount = await pool.query(`SELECT count(*) FROM municipalities WHERE region_id IS NULL`);
        console.log(`Remaining municipalities with NULL region_id: ${nullCount.rows[0].count}`);
    } finally {
        await pool.end();
    }
}

run();

// extra script to check remaining nulls
