import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.POSTGRES_DB || 'work_job',
});

const jsonPath = path.join(__dirname, '../node_modules/decoupage-territorial-benin/decoupage_territorial_benin.json');
const beninData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function run() {
    // Count in JSON
    let jsonMun = 0, jsonDist = 0, jsonNeigh = 0;
    for (const dep of beninData) {
        for (const commune of (dep.communes || [])) {
            jsonMun++;
            for (const arr of (commune.arrondissements || [])) {
                jsonDist++;
                for (const q of (arr.quartiers || [])) jsonNeigh++;
            }
        }
    }
    console.log('JSON data: municipalities=', jsonMun, 'districts=', jsonDist, 'neighborhoods=', jsonNeigh);
    
    // Check codes in DB vs JSON
    const sample = await pool.query('SELECT code, name FROM municipalities ORDER BY name LIMIT 5');
    console.log('Sample DB codes:', sample.rows);
    
    const firstJson = beninData[0]?.communes?.[0];
    console.log('First JSON commune id_com:', firstJson?.id_com, 'name:', firstJson?.lib_com);
    
    await pool.end();
}
run();
