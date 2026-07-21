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

// Load the JSON file directly from the installed package
const jsonPath = path.join(__dirname, '../node_modules/decoupage-territorial-benin/decoupage_territorial_benin.json');
const beninData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function seed() {
    const client = await pool.connect();
    console.log('--- Démarrage du Seeding COMPLET du Territoire du Bénin ---');
    console.log('Mode: UPSERT (Mise à jour sécurisée sans suppression)');

    try {
        await client.query('BEGIN');

        let organizationId: string;
        const orgRes = await client.query('SELECT id FROM organizations LIMIT 1');
        if (orgRes.rows.length === 0) {
            console.log('Aucune organisation trouvée. Création d\'une organisation par défaut...');
            const newOrg = await client.query(`
                INSERT INTO organizations (code, name)
                VALUES ($1, $2)
                RETURNING id
            `, ['org-default', 'Default Organization']);
            organizationId = newOrg.rows[0].id;
        } else {
            organizationId = orgRes.rows[0].id;
        }

        // We don't delete to avoid breaking foreign keys on users, reports, etc.
        // We will insert if not exists, or update if exists.

        for (const dep of beninData) {
            const departmentName = dep.lib_dep;
            console.log(`\n📂 Traitement du Département : ${departmentName}`);

            if (dep.communes) {
                for (const commune of dep.communes) {
                    const cityCode = commune.id_com.toString();
                    
                    // UPSERT Municipality
                    let cityId: string;
                    const cityCheck = await client.query('SELECT id FROM municipalities WHERE code = $1', [cityCode]);
                    
                    if (cityCheck.rows.length > 0) {
                        cityId = cityCheck.rows[0].id;
                        await client.query('UPDATE municipalities SET name = $1, department = $2 WHERE id = $3', [commune.lib_com, departmentName, cityId]);
                    } else {
                        const cityRes = await client.query(`
                            INSERT INTO municipalities (organization_id, code, name, department)
                            VALUES ($1, $2, $3, $4)
                            RETURNING id
                        `, [organizationId, cityCode, commune.lib_com, departmentName]);
                        cityId = cityRes.rows[0].id;
                    }

                    if (commune.arrondissements) {
                        for (const arr of commune.arrondissements) {
                            const districtCode = arr.id_arrond.toString();
                            
                            // UPSERT District
                            let districtId: string;
                            const distCheck = await client.query('SELECT id FROM districts WHERE municipality_id = $1 AND code = $2', [cityId, districtCode]);
                            
                            if (distCheck.rows.length > 0) {
                                districtId = distCheck.rows[0].id;
                                await client.query('UPDATE districts SET name = $1 WHERE id = $2', [arr.lib_arrond, districtId]);
                            } else {
                                const distRes = await client.query(`
                                    INSERT INTO districts (municipality_id, code, name)
                                    VALUES ($1, $2, $3)
                                    RETURNING id
                                `, [cityId, districtCode, arr.lib_arrond]);
                                districtId = distRes.rows[0].id;
                            }

                            if (arr.quartiers) {
                                for (const quartier of arr.quartiers) {
                                    const quartierCode = quartier.id_quart.toString();
                                    
                                    // UPSERT Neighborhood
                                    const qCheck = await client.query('SELECT id FROM neighborhoods WHERE district_id = $1 AND code = $2', [districtId, quartierCode]);
                                    if (qCheck.rows.length > 0) {
                                        await client.query('UPDATE neighborhoods SET name = $1 WHERE id = $2', [quartier.lib_quart, qCheck.rows[0].id]);
                                    } else {
                                        await client.query(`
                                            INSERT INTO neighborhoods (district_id, code, name)
                                            VALUES ($1, $2, $3)
                                        `, [districtId, quartierCode, quartier.lib_quart]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        await client.query('COMMIT');
        console.log('\n✅ Seeding terminé avec succès ! Les 12 départements, 77 communes, 546 arrondissements et tous les quartiers ont été mis à jour.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur durant le seeding :', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
