

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost',
    port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_DATABASE || process.env.DB_NAME || process.env.POSTGRES_DB || 'work_job',
});

// Normalise les noms pour améliorer la recherche (sans accents, minuscules, espaces épurés)
function normalizeName(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/[^a-z0-9]/g, "");     // Garde uniquement alphanumérique
}

async function run() {
    const client = await pool.connect();
    try {
        console.log('--- STARTING MUNICIPALITY SEED ---');
        
        // 1. Récupérer l'organisation par défaut
        const orgResult = await client.query("SELECT id FROM organizations WHERE code = 'org-default' OR code = 'default' LIMIT 1");
        let organizationId: string;
        if (orgResult.rows.length === 0) {
            console.log('No organization found. Creating default organization...');
            const newOrg = await client.query(`
                INSERT INTO organizations (code, name)
                VALUES ($1, $2)
                RETURNING id
            `, ['org-default', 'Default Organization']);
            organizationId = newOrg.rows[0].id;
        } else {
            organizationId = orgResult.rows[0].id;
        }
        console.log(`Using Organization ID: ${organizationId}`);

        // 2. Charger le fichier GeoJSON
        // Note: On utilise un chemin relatif par rapport à la racine du projet ou absolu si possible
        const geojsonPath = path.resolve(__dirname, '../../data/ben_admin_boundaries.geojson/ben_admin2.geojson');
        console.log(`Reading GeoJSON from: ${geojsonPath}`);
        if (!fs.existsSync(geojsonPath)) {
            throw new Error(`GeoJSON file not found at ${geojsonPath}`);
        }
        
        const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
        const features = geojsonData.features;
        console.log(`Found ${features.length} features/communes in GeoJSON.`);

        // 3. Récupérer les municipalités existantes en base
        const existingMunResult = await client.query("SELECT id, name, code FROM municipalities");
        const existingMunicipalities = existingMunResult.rows;
        console.log(`Found ${existingMunicipalities.length} existing municipalities in DB.`);

        // 4. Parcourir et importer chaque commune
        let updatedCount = 0;
        let insertedCount = 0;

        for (const feature of features) {
            const props = feature.properties;
            const geom = feature.geometry;

            const adm2_name = props.adm2_name; // Nom de la commune
            const adm2_pcode = props.adm2_pcode; // Code (ex: BJ1201)
            const adm1_name = props.adm1_name; // Département (ex: Zou)

            if (!adm2_name || !adm2_pcode) {
                console.warn('Skipping feature without name or pcode:', props);
                continue;
            }

            // Chercher une correspondance dans les communes existantes
            const normAdm2Name = normalizeName(adm2_name);
            const matchedMun = existingMunicipalities.find(m => 
                normalizeName(m.name) === normAdm2Name || 
                (m.code && m.code.toLowerCase() === adm2_pcode.toLowerCase())
            );

            const geomJsonStr = JSON.stringify(geom);

            if (matchedMun) {
                // Mise à jour de la commune existante
                const updateSql = `
                    UPDATE municipalities 
                    SET code = $1, department = $2, geometry = ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($3)), 4326)
                    WHERE id = $4
                `;
                await client.query(updateSql, [adm2_pcode, adm1_name, geomJsonStr, matchedMun.id]);
                updatedCount++;
            } else {
                // Insertion d'une nouvelle commune
                const insertSql = `
                    INSERT INTO municipalities (organization_id, code, name, department, geometry)
                    VALUES ($1, $2, $3, $4, ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($5)), 4326))
                `;
                await client.query(insertSql, [organizationId, adm2_pcode, adm2_name, adm1_name, geomJsonStr]);
                insertedCount++;
            }
        }

        // 5. Mettre à jour les region_id (départements) si la table regions existe
        const regionsExist = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'regions'
            )
        `);
        
        if (regionsExist.rows[0].exists) {
            console.log('Updating region_id from spatial intersection...');
            await client.query(`
                UPDATE municipalities m
                SET region_id = r.id
                FROM regions r
                WHERE ST_Intersects(ST_Centroid(m.geometry), r.geometry) AND m.geometry IS NOT NULL
            `);
        }

        console.log(`Municipality seed completed!`);
        console.log(`- Updated: ${updatedCount} municipalities`);
        console.log(`- Inserted: ${insertedCount} municipalities`);

    } catch (e) {
        console.error('Error during municipality seed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
