/**
 * Seed du territoire béninois depuis le package npm `decoupage-territorial-benin`.
 * Source : node_modules/decoupage-territorial-benin/decoupage_territorial_benin.json
 * 
 * Usage : npm run seed:territory
 * 
 * Structure du JSON :
 *   [département: { id_dep, lib_dep, communes: [{ id_com, lib_com, arrondissements: [{ id_arrond, lib_arrond, quartiers: [{ id_quart, lib_quart }] }] }] }]
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hse_terra',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT || 5432),
};

interface Quartier {
    id_quart: number;
    lib_quart: string;
}

interface Arrondissement {
    id_arrond: number;
    lib_arrond: string;
    quartiers: Quartier[];
}

interface Commune {
    id_com: number;
    lib_com: string;
    arrondissements: Arrondissement[];
}

interface Departement {
    id_dep: number;
    lib_dep: string;
    communes: Commune[];
}

async function main() {
    console.log('🗺️  Seed Territoire — Bénin (decoupage-territorial-benin)\n');
    const pool = new Pool(DB);
    const client = await pool.connect();

    try {
        await client.query('SELECT 1');
        console.log('✅ Connexion OK\n');

        // Charger le JSON depuis le package npm
        const data: Departement[] = require('../node_modules/decoupage-territorial-benin/decoupage_territorial_benin.json');

        console.log(`📦 ${data.length} départements chargés`);

        // Vider les tables (ordre inverse des FK)
        await client.query('BEGIN');
        await client.query('DELETE FROM neighborhoods');
        await client.query('DELETE FROM districts');
        await client.query('DELETE FROM municipalities');
        await client.query('DELETE FROM regions');

        let regionCount = 0;
        let municipalityCount = 0;
        let districtCount = 0;
        let neighborhoodCount = 0;

        for (const dep of data) {
            // 1. Insérer la région (département)
            const regionResult = await client.query(
                `INSERT INTO regions (id, code, name)
                 VALUES (gen_random_uuid(), $1, $2)
                 RETURNING id`,
                [`BJ-${String(dep.id_dep).padStart(2, '0')}`, dep.lib_dep]
            );
            const regionId = regionResult.rows[0].id;
            regionCount++;
            console.log(`   ✅ Région : ${dep.lib_dep}`);

            for (const com of dep.communes) {
                // 2. Insérer la commune
                const munResult = await client.query(
                    `INSERT INTO municipalities (id, region_id, code, name)
                     VALUES (gen_random_uuid(), $1, $2, $3)
                     RETURNING id`,
                    [regionId, `BJ-${String(dep.id_dep).padStart(2, '0')}-${String(com.id_com).padStart(2, '0')}`, com.lib_com]
                );
                const municipalityId = munResult.rows[0].id;
                municipalityCount++;
                if (municipalityCount <= 10 || municipalityCount % 15 === 0) {
                    console.log(`      ✅ Commune : ${com.lib_com}`);
                }

                for (const arr of com.arrondissements) {
                    // 3. Insérer l'arrondissement
                    const distResult = await client.query(
                        `INSERT INTO districts (id, municipality_id, code, name)
                         VALUES (gen_random_uuid(), $1, $2, $3)
                         RETURNING id`,
                        [municipalityId, `BJ-${String(dep.id_dep).padStart(2, '0')}-${String(com.id_com).padStart(2, '0')}-${String(arr.id_arrond).padStart(2, '0')}`, arr.lib_arrond]
                    );
                    const districtId = distResult.rows[0].id;
                    districtCount++;

                    // 4. Insérer les quartiers
                    for (const q of arr.quartiers) {
                        await client.query(
                            `INSERT INTO neighborhoods (id, district_id, code, name)
                             VALUES (gen_random_uuid(), $1, $2, $3)`,
                            [districtId, `${arr.id_arrond}-${q.id_quart}`, q.lib_quart]
                        );
                        neighborhoodCount++;
                    }
                }
            }
        }

        await client.query('COMMIT');

        console.log('\n📊 Résumé :');
        console.log(`   Régions       : ${regionCount}`);
        console.log(`   Communes      : ${municipalityCount}`);
        console.log(`   Arrondissements: ${districtCount}`);
        console.log(`   Quartiers     : ${neighborhoodCount}`);

    } catch (e: any) {
        console.error('❌', e.message);
        try { await client.query('ROLLBACK'); } catch {}
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();