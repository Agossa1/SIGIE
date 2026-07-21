import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import redisClient from '../../../../apps/backend/src/config/redis/redisConfig';
import {
    CreateMunicipalityDTO,
    Municipality,
    Region,
    District,
    Neighborhood,
    GeoJsonFeatureCollection,
    GeoJsonFeature,
    TerritoryGeoJsonLevel,
    UpdateMunicipalityDTO,
} from '../types/territory.types';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import type { Logger } from 'winston';

export class TerritoryRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) { }

    /**
     * Crée une municipalité et ses districts/quartiers associés dans une transaction ACID.
     */
    async createMunicipalityWithHierarchy(dto: CreateMunicipalityDTO): Promise<string> {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN'); // DEBUT DE TRANSACTION

            // 1. Insertion de la municipalité
            const insertMunicipalitySql = `
                INSERT INTO municipalities (
                    organization_id, code, name, department
                ) VALUES ($1, $2, $3, $4) RETURNING id
            `;
            const municipalityResult = await client.query(insertMunicipalitySql, [
                dto.organizationId, dto.code, dto.name, dto.department
            ]);
            const municipalityId = municipalityResult.rows[0].id;

            // 2. Insertion des districts et de leurs quartiers
            if (dto.districts && dto.districts.length > 0) {
                for (const district of dto.districts) {
                    const insertDistrictSql = `
                        INSERT INTO districts (
                            municipality_id, code, name
                        ) VALUES ($1, $2, $3) RETURNING id
                    `;
                    const districtResult = await client.query(insertDistrictSql, [
                        municipalityId, district.code, district.name
                    ]);
                    const districtId = districtResult.rows[0].id;

                    // 3. Insertion des quartiers pour ce district
                    if (district.neighborhoods && district.neighborhoods.length > 0) {
                        for (const neighborhood of district.neighborhoods) {
                            const insertNeighborhoodSql = `
                                INSERT INTO neighborhoods (
                                    district_id, code, name
                                ) VALUES ($1, $2, $3)
                            `;
                            await client.query(insertNeighborhoodSql, [
                                districtId, neighborhood.code, neighborhood.name
                            ]);
                        }
                    }
                }
            }

            await client.query('COMMIT'); // VALIDATION TRANSACTION
            return municipalityId;
        } catch (error) {
            await client.query('ROLLBACK'); // ANNULATION EN CAS D'ERREUR
            this.logger.error('Transaction error in createMunicipalityWithHierarchy:', error);
            throw new BadRequestError('Erreur lors de la création de la hiérarchie territoriale');
        } finally {
            client.release();
        }
    }

    async getRegions(): Promise<Region[]> {
        try {
            const sql = `
                SELECT id, code, name
                FROM regions
                ORDER BY name ASC
            `;
            const result = await this.db.query(sql);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching regions:', error);
            throw new BadRequestError('Erreur lors de la récupération des régions');
        }
    }

    async getMunicipalitiesByRegion(regionId: string): Promise<Municipality[]> {
        try {
            const sql = `
                SELECT
                    m.id,
                    m.organization_id as "organizationId",
                    m.code,
                    m.name,
                    m.region_id as "regionId",
                    m.department,
                    m.created_at as "createdAt"
                FROM municipalities m
                WHERE m.region_id = $1
                ORDER BY m.name ASC
            `;
            const result = await this.db.query(sql, [regionId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching municipalities by region:', error);
            throw new BadRequestError('Erreur lors de la récupération des municipalités');
        }
    }

    async getDistrictsByMunicipality(municipalityId: string): Promise<District[]> {
        try {
            const sql = `
                SELECT
                    d.id,
                    d.municipality_id as "municipalityId",
                    d.code,
                    d.name,
                    d.created_at as "createdAt"
                FROM districts d
                WHERE d.municipality_id = $1
                ORDER BY d.name ASC
            `;
            const result = await this.db.query(sql, [municipalityId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching districts by municipality:', error);
            throw new BadRequestError('Erreur lors de la récupération des arrondissements');
        }
    }

    async getNeighborhoodsByDistrict(districtId: string): Promise<Neighborhood[]> {
        try {
            const sql = `
                SELECT
                    n.id,
                    n.district_id as "districtId",
                    n.code,
                    n.name,
                    n.created_at as "createdAt"
                FROM neighborhoods n
                WHERE n.district_id = $1
                ORDER BY n.name ASC
            `;
            const result = await this.db.query(sql, [districtId]);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching neighborhoods by district:', error);
            throw new BadRequestError('Erreur lors de la récupération des quartiers');
        }
    }

    /**
     * Récupère la liste des municipalités
     */
    async getMunicipalities(): Promise<Municipality[]> {
        try {
            const sql = `
                SELECT 
                    id, organization_id as "organizationId", code, name, department, created_at as "createdAt"
                FROM municipalities
                ORDER BY name ASC
            `;
            const result = await this.db.query(sql);
            return result.rows;
        } catch (error) {
            this.logger.error('Error fetching municipalities:', error);
            throw new BadRequestError('Erreur lors de la récupération des municipalités');
        }
    }

    /**
     * Récupère la hiérarchie complète (pour un affichage arborescent).
     * Si organizationId est fourni, filtre par organisation.
     * Sinon, retourne toutes les municipalités (le service applique le filtre par rôle).
     */
    async getFullTerritoryHierarchy(organizationId: string | null): Promise<any[]> {
        try {
            if (organizationId) {
                const sql = `
                    SELECT 
                        r.id as "regionId", r.name as "regionName", r.code as "regionCode",
                        m.id as "municipalityId", m.name as "municipalityName", m.code as "municipalityCode",
                        m.department as "municipalityDepartment", m.region_id as "municipalityRegionId",
                        d.id as "districtId", d.name as "districtName", d.code as "districtCode",
                        n.id as "neighborhoodId", n.name as "neighborhoodName", n.code as "neighborhoodCode"
                    FROM regions r
                    LEFT JOIN municipalities m ON m.region_id = r.id AND m.organization_id = $1
                    LEFT JOIN districts d ON m.id = d.municipality_id
                    LEFT JOIN neighborhoods n ON d.id = n.district_id
                    ORDER BY r.name, m.name, d.name, n.name
                `;
                const result = await this.db.query(sql, [organizationId]);
                return result.rows;
            } else {
                const sql = `
                    SELECT 
                        r.id as "regionId", r.name as "regionName", r.code as "regionCode",
                        m.id as "municipalityId", m.name as "municipalityName", m.code as "municipalityCode",
                        m.department as "municipalityDepartment", m.region_id as "municipalityRegionId",
                        d.id as "districtId", d.name as "districtName", d.code as "districtCode",
                        n.id as "neighborhoodId", n.name as "neighborhoodName", n.code as "neighborhoodCode"
                    FROM regions r
                    LEFT JOIN municipalities m ON m.region_id = r.id
                    LEFT JOIN districts d ON m.id = d.municipality_id
                    LEFT JOIN neighborhoods n ON d.id = n.district_id
                    ORDER BY r.name, m.name, d.name, n.name
                `;
                const result = await this.db.query(sql);
                return result.rows;
            }
        } catch (error) {
            this.logger.error('Error fetching territory hierarchy:', error);
            throw new BadRequestError('Erreur lors de la récupération de la hiérarchie territoriale');
        }
    }

    async deleteMunicipality(id: string): Promise<void> {
        try {
            const sql = 'DELETE FROM municipalities WHERE id = $1';
            await this.db.query(sql, [id]);
        } catch (error) {
            this.logger.error('Error deleting municipality:', error);
            throw new BadRequestError('Erreur lors de la suppression de la municipalité');
        }
    }

    /**
     * Récupère les informations territoriales et les rôles d'un utilisateur.
     */
    async getUserTerritoryInfo(userId: string): Promise<{
        municipalityId: string | null;
        districtId: string | null;
        regionId: string | null;
        department: string | null;
        roles: string[];
    }> {
        try {
            const userSql = `
                SELECT 
                    u.id, 
                    u.municipality_id as "municipalityId", 
                    u.district_id as "districtId",
                    u.region_id as "regionId",
                    u.department,
                    array_agg(rol.name) as roles
                FROM users u
                LEFT JOIN role_user ru ON u.id = ru.user_id
                LEFT JOIN roles rol ON ru.role_id = rol.id
                WHERE u.id = $1
                GROUP BY u.id
            `;
            const userResult = await this.db.query(userSql, [userId]);
            if (userResult.rows.length === 0) {
                throw new BadRequestError("Utilisateur non trouvé");
            }
            return userResult.rows[0];
        } catch (error) {
            this.logger.error('Error fetching user territory info:', error);
            throw new BadRequestError('Erreur lors de la récupération des informations utilisateur');
        }
    }

    /**
     * Récupère le boundary GeoJSON associé à un utilisateur en fonction de son rôle et de sa configuration territoriale.
     */
    async getUserBoundary(userId: string): Promise<any> {
        try {
            // 1. Charger l'utilisateur avec ses rôles et territorialités
            const user = await this.getUserTerritoryInfo(userId);

            // 2. Déterminer le type de limite territoriale à renvoyer

            // Cas 1 : CD (Chef d'Arrondissement) -> districtId est configuré
            if (user.districtId) {
                const districtSql = `
                    SELECT 
                        d.name as "districtName",
                        d.code as "districtCode",
                        m.name as "municipalityName",
                        ST_AsGeoJSON(m.geometry) as "geometry"
                    FROM districts d
                    JOIN municipalities m ON d.municipality_id = m.id
                    WHERE d.id = $1
                `;
                const distResult = await this.db.query(districtSql, [user.districtId]);
                if (distResult.rows.length > 0) {
                    const row = distResult.rows[0];
                    return {
                        type: 'district',
                        name: row.districtName,
                        code: row.districtCode,
                        municipalityName: row.municipalityName,
                        boundary: row.geometry ? JSON.parse(row.geometry) : null
                    };
                }
            }

            // Cas 2 : Maire -> municipalityId est configuré
            if (user.municipalityId) {
                const munSql = `
                    SELECT name, code, department, ST_AsGeoJSON(geometry) as "geometry"
                    FROM municipalities
                    WHERE id = $1
                `;
                const munResult = await this.db.query(munSql, [user.municipalityId]);
                if (munResult.rows.length > 0) {
                    const row = munResult.rows[0];
                    return {
                        type: 'municipality',
                        name: row.name,
                        code: row.code,
                        department: row.department,
                        boundary: row.geometry ? JSON.parse(row.geometry) : null
                    };
                }
            }

            // Cas 3 : Directeur préfectoral / régional -> region_id
            if (user.regionId) {
                const regionSql = `
                    SELECT r.name, r.code,
                        ST_AsGeoJSON(
                            COALESCE(
                                r.geometry,
                                (SELECT ST_Union(m.geometry) FROM municipalities m WHERE m.region_id = r.id AND m.geometry IS NOT NULL)
                            )
                        ) as "geometry"
                    FROM regions r
                    WHERE r.id = $1
                `;
                const regionResult = await this.db.query(regionSql, [user.regionId]);
                if (regionResult.rows.length > 0 && regionResult.rows[0].geometry) {
                    const row = regionResult.rows[0];
                    return {
                        type: 'region',
                        name: row.name,
                        code: row.code,
                        boundary: JSON.parse(row.geometry),
                    };
                }
            }

            // Cas 4 : Directeur Départemental (legacy) -> department est configuré
            if (user.department) {
                const deptSql = `
                    SELECT ST_AsGeoJSON(ST_Union(geometry)) as "geometry"
                    FROM municipalities
                    WHERE LOWER(department) = LOWER($1)
                `;
                const deptResult = await this.db.query(deptSql, [user.department]);
                if (deptResult.rows.length > 0 && deptResult.rows[0].geometry) {
                    return {
                        type: 'department',
                        name: user.department,
                        boundary: JSON.parse(deptResult.rows[0].geometry)
                    };
                }
            }

            // Cas 5 : Super Admin / Platform Admin / Ministère -> périmètre national
            const nationalSql = `
                SELECT ST_AsGeoJSON(ST_Union(geometry)) as "geometry"
                FROM municipalities
            `;
            const nationalResult = await this.db.query(nationalSql);
            if (nationalResult.rows.length > 0 && nationalResult.rows[0].geometry) {
                return {
                    type: 'national',
                    name: 'Bénin',
                    boundary: JSON.parse(nationalResult.rows[0].geometry)
                };
            }

            return {
                type: 'none',
                name: 'Aucune limite',
                boundary: null
            };

        } catch (error) {
            this.logger.error('Error fetching user boundary:', error);
            throw new BadRequestError('Erreur lors du calcul des limites territoriales');
        }
    }

    /**
     * Trouve la municipalité contenant la coordonnée GPS (latitude, longitude) spécifiée.
     */
    async getMunicipalityByCoords(longitude: number, latitude: number): Promise<any> {
        try {
            const hierarchy = await this.getHierarchyByCoords(longitude, latitude);
            if (hierarchy) {
                return {
                    regionId: hierarchy.region_id,
                    regionName: hierarchy.region_name,
                    municipalityId: hierarchy.municipality_id,
                    name: hierarchy.municipality_name,
                    districtId: hierarchy.district_id,
                    districtName: hierarchy.district_name,
                    neighborhoodId: hierarchy.neighborhood_id,
                    neighborhoodName: hierarchy.neighborhood_name,
                };
            }

            const sql = `
                SELECT m.id, m.name, m.code, m.department, m.region_id as "regionId", r.name as "regionName"
                FROM municipalities m
                LEFT JOIN regions r ON m.region_id = r.id
                WHERE ST_Contains(m.geometry, ST_SetSRID(ST_MakePoint($1, $2), 4326))
                LIMIT 1
            `;
            const result = await this.db.query(sql, [longitude, latitude]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('Error fetching municipality by coordinates:', error);
            throw new BadRequestError('Erreur lors du géocodage inverse');
        }
    }

    /**
     * Trouve la hiérarchie territoriale complète (Région, Commune, Arrondissement, Quartier) 
     * contenant la coordonnée GPS (latitude, longitude).
     */
    private emptyFeatureCollection(): GeoJsonFeatureCollection {
        return { type: 'FeatureCollection', features: [] };
    }

    /**
     * Construit une FeatureCollection GeoJSON pour un niveau territorial.
     * tolerance > 0 applique ST_SimplifyPreserveTopology (degrés WGS84).
     */
    async getGeoJsonByLevel(
        level: TerritoryGeoJsonLevel,
        options: {
            tolerance?: number;
            regionId?: string;
            municipalityId?: string;
            districtId?: string;
        } = {}
    ): Promise<GeoJsonFeatureCollection> {
        const tolerance = options.tolerance ?? this.defaultTolerance(level);

        const cacheKey = `territory_geojson:${level}:${tolerance}:${options.regionId || ''}:${options.municipalityId || ''}:${options.districtId || ''}`;
        
        // Import redisClient dynamically or ensure it's available at the top. Wait, we'll import it at the top of the file!
        // I will do a separate tool call to add import redisClient if it's missing.

        try {
            if (redisClient.isOpen) {
                const cached = await redisClient.get(cacheKey);
                if (cached) return JSON.parse(cached) as GeoJsonFeatureCollection;
            }
        } catch (error) {
            this.logger.warn(`Redis GET error for territory ${cacheKey}`, error);
        }

        try {
            let sql = '';
            const params: unknown[] = [tolerance];

            switch (level) {
                case 'regions':
                    params.push(options.regionId ?? null);
                    sql = `
                        SELECT json_build_object(
                            'type', 'FeatureCollection',
                            'features', COALESCE(json_agg(feature ORDER BY name), '[]'::json)
                        ) AS geojson
                        FROM (
                            SELECT json_build_object(
                                'type', 'Feature',
                                'id', r.id,
                                'geometry', ST_AsGeoJSON(
                                    CASE
                                        WHEN $1::float8 > 0 THEN ST_SimplifyPreserveTopology(g.geom, $1::float8)
                                        ELSE g.geom
                                    END
                                )::json,
                                'properties', json_build_object(
                                    'id', r.id,
                                    'name', r.name,
                                    'code', r.code
                                )
                            ) AS feature,
                            r.name
                            FROM regions r
                            CROSS JOIN LATERAL (
                                SELECT COALESCE(
                                    r.geometry,
                                    (
                                        SELECT ST_Union(m.geometry)
                                        FROM municipalities m
                                        WHERE m.region_id = r.id AND m.geometry IS NOT NULL
                                    )
                                ) AS geom
                            ) g
                            WHERE g.geom IS NOT NULL
                              AND ($2::uuid IS NULL OR r.id = $2::uuid)
                        ) sub
                    `;
                    break;

                case 'municipalities':
                    params.push(options.regionId ?? null);
                    sql = `
                        SELECT json_build_object(
                            'type', 'FeatureCollection',
                            'features', COALESCE(json_agg(feature ORDER BY name), '[]'::json)
                        ) AS geojson
                        FROM (
                            SELECT json_build_object(
                                'type', 'Feature',
                                'id', m.id,
                                'geometry', ST_AsGeoJSON(
                                    CASE
                                        WHEN $1::float8 > 0 THEN ST_SimplifyPreserveTopology(m.geometry, $1::float8)
                                        ELSE m.geometry
                                    END
                                )::json,
                                'properties', json_build_object(
                                    'id', m.id,
                                    'name', m.name,
                                    'code', m.code,
                                    'regionId', m.region_id,
                                    'department', m.department
                                )
                            ) AS feature,
                            m.name
                            FROM municipalities m
                            WHERE m.geometry IS NOT NULL
                              AND ($2::uuid IS NULL OR m.region_id = $2::uuid)
                        ) sub
                    `;
                    break;

                case 'districts':
                    params.push(options.municipalityId ?? null);
                    params.push(options.regionId ?? null);
                    sql = `
                        SELECT json_build_object(
                            'type', 'FeatureCollection',
                            'features', COALESCE(json_agg(feature ORDER BY name), '[]'::json)
                        ) AS geojson
                        FROM (
                            SELECT json_build_object(
                                'type', 'Feature',
                                'id', d.id,
                                'geometry', ST_AsGeoJSON(
                                    CASE
                                        WHEN $1::float8 > 0 THEN ST_SimplifyPreserveTopology(d.geometry, $1::float8)
                                        ELSE d.geometry
                                    END
                                )::json,
                                'properties', json_build_object(
                                    'id', d.id,
                                    'name', d.name,
                                    'code', d.code,
                                    'municipalityId', d.municipality_id
                                )
                            ) AS feature,
                            d.name
                            FROM districts d
                            JOIN municipalities m ON d.municipality_id = m.id
                            WHERE d.geometry IS NOT NULL
                              AND ($2::uuid IS NULL OR d.municipality_id = $2::uuid)
                              AND ($3::uuid IS NULL OR m.region_id = $3::uuid)
                        ) sub
                    `;
                    break;

                case 'neighborhoods':
                    params.push(options.districtId ?? null);
                    params.push(options.municipalityId ?? null);
                    params.push(options.regionId ?? null);
                    sql = `
                        SELECT json_build_object(
                            'type', 'FeatureCollection',
                            'features', COALESCE(json_agg(feature ORDER BY name), '[]'::json)
                        ) AS geojson
                        FROM (
                            SELECT json_build_object(
                                'type', 'Feature',
                                'id', n.id,
                                'geometry', ST_AsGeoJSON(
                                    CASE
                                        WHEN $1::float8 > 0 THEN ST_SimplifyPreserveTopology(n.geometry, $1::float8)
                                        ELSE n.geometry
                                    END
                                )::json,
                                'properties', json_build_object(
                                    'id', n.id,
                                    'name', n.name,
                                    'code', n.code,
                                    'districtId', n.district_id
                                )
                            ) AS feature,
                            n.name
                            FROM neighborhoods n
                            JOIN districts d ON n.district_id = d.id
                            JOIN municipalities m ON d.municipality_id = m.id
                            WHERE n.geometry IS NOT NULL
                              AND ($2::uuid IS NULL OR n.district_id = $2::uuid)
                              AND ($3::uuid IS NULL OR d.municipality_id = $3::uuid)
                              AND ($4::uuid IS NULL OR m.region_id = $4::uuid)
                        ) sub
                    `;
                    break;

                default:
                    return this.emptyFeatureCollection();
            }

            const result = await this.db.query(sql, params);
            const geojson = result.rows[0]?.geojson;
            if (!geojson) return this.emptyFeatureCollection();
            const geoJsonData = typeof geojson === 'string' ? JSON.parse(geojson) : geojson;

            try {
                if (redisClient.isOpen) {
                    await redisClient.setEx(cacheKey, 86400, JSON.stringify(geoJsonData));
                }
            } catch (error) {
                this.logger.warn(`Redis SET error for territory ${cacheKey}`, error);
            }

            return geoJsonData;
        } catch (error) {
            this.logger.error(`Error fetching GeoJSON for level ${level}:`, error);
            throw new BadRequestError(`Erreur lors de la récupération des géométries (${level})`);
        }
    }

    private defaultTolerance(level: TerritoryGeoJsonLevel): number {
        switch (level) {
            case 'regions':
                return 0.01;
            case 'municipalities':
                return 0.005;
            case 'districts':
                return 0.002;
            case 'neighborhoods':
                return 0.001;
            default:
                return 0;
        }
    }

    async getHierarchyByCoords(longitude: number, latitude: number): Promise<any> {
        try {
            const sql = `
                SELECT 
                    n.id as neighborhood_id,
                    n.name as neighborhood_name,
                    d.id as district_id,
                    d.name as district_name,
                    m.id as municipality_id,
                    m.name as municipality_name,
                    r.id as region_id,
                    r.name as region_name
                FROM neighborhoods n
                JOIN districts d ON n.district_id = d.id
                JOIN municipalities m ON d.municipality_id = m.id
                JOIN regions r ON m.region_id = r.id
                WHERE ST_Contains(n.geometry, ST_SetSRID(ST_MakePoint($1, $2), 4326))
                LIMIT 1
            `;
            const result = await this.db.query(sql, [longitude, latitude]);
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('Error fetching territory hierarchy by coordinates:', error);
            throw new BadRequestError('Erreur lors du géocodage inverse complet');
        }
    }

    /**
     * GetMunicipalityById
     */
    async getMunicipalityById(id: string): Promise<any> {
        try {
            const result = await this.db.query(
                `SELECT * FROM municipalities WHERE id = $1`,
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            this.logger.error('Error fetching municipality by id:', error);
            throw new BadRequestError('Erreur lors de la récupération de la municipalité');
        }
    }

    /**
     * UpdateMunicipality
     */
    async updateMunicipality(id: string, dto: UpdateMunicipalityDTO): Promise<void> {
        try {
            const sql = `
                UPDATE municipalities 
                SET 
                    name = COALESCE($2, name),
                    code = COALESCE($3, code),
                    department = COALESCE($4, department),
                    region_id = COALESCE($5, region_id),
                    geometry = COALESCE($6, geometry)
                WHERE id = $1
            `;
            await this.db.query(sql, [
                id,
                dto.name,
                dto.code,
                dto.department,
                dto.regionId,
                dto.geometry
            ]);
        } catch (error) {
            this.logger.error('Error updating municipality:', error);
            throw new BadRequestError('Erreur lors de la mise à jour de la municipalité');
        }
    }

    // ============================================================================
    // GIS UPSERT METHODS
    // ============================================================================

    private extractFeatureProps(feature: GeoJsonFeature) {
        const props = feature.properties || {};
        const name = (props.name || props.nom || props.label || props.title || 'Inconnu') as string;
        const code = (props.code || props.id || null) as string | null;
        return { name, code };
    }

    async upsertRegions(features: GeoJsonFeature[]): Promise<void> {
        if (features.length === 0) return;
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            await client.query(`
                CREATE TEMP TABLE IF NOT EXISTS temp_regions (
                    name VARCHAR(255),
                    code VARCHAR(50),
                    geom GEOMETRY
                ) ON COMMIT DROP;
            `);

            const BATCH_SIZE = 500;
            for (let i = 0; i < features.length; i += BATCH_SIZE) {
                const chunk = features.slice(i, i + BATCH_SIZE);
                const valueStrings = [];
                const queryParams: any[] = [];
                let paramIndex = 1;
                for (const feature of chunk) {
                    if (!feature.geometry) continue;
                    const { name, code } = this.extractFeatureProps(feature);
                    const geomJson = JSON.stringify(feature.geometry);
                    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, ST_Multi(ST_GeomFromGeoJSON($${paramIndex + 2})))`);
                    queryParams.push(name, code, geomJson);
                    paramIndex += 3;
                }
                if (valueStrings.length > 0) {
                    await client.query(`INSERT INTO temp_regions (name, code, geom) VALUES ${valueStrings.join(', ')}`, queryParams);
                }
            }

            await client.query(`
                UPDATE regions r
                SET geometry = t.geom, name = COALESCE(r.name, t.name)
                FROM temp_regions t
                WHERE r.code = t.code AND t.code IS NOT NULL
            `);

            await client.query(`
                UPDATE regions r
                SET geometry = t.geom, code = COALESCE(r.code, t.code)
                FROM temp_regions t
                WHERE LOWER(r.name) = LOWER(t.name)
                AND NOT EXISTS (SELECT 1 FROM regions r2 WHERE r2.code = t.code AND t.code IS NOT NULL)
            `);

            await client.query(`
                INSERT INTO regions (name, code, geometry)
                SELECT t.name, t.code, t.geom
                FROM temp_regions t
                WHERE NOT EXISTS (SELECT 1 FROM regions r WHERE r.code = t.code AND t.code IS NOT NULL)
                AND NOT EXISTS (SELECT 1 FROM regions r WHERE LOWER(r.name) = LOWER(t.name))
            `);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error in upsertRegions:', error);
            throw new BadRequestError('Erreur lors de la mise à jour des régions via SIG');
        } finally {
            client.release();
        }
    }

    async upsertMunicipalities(features: GeoJsonFeature[]): Promise<void> {
        if (features.length === 0) return;
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            await client.query(`
                CREATE TEMP TABLE IF NOT EXISTS temp_municipalities (
                    name VARCHAR(255),
                    code VARCHAR(50),
                    department VARCHAR(255),
                    geom GEOMETRY
                ) ON COMMIT DROP;
            `);

            const BATCH_SIZE = 500;
            for (let i = 0; i < features.length; i += BATCH_SIZE) {
                const chunk = features.slice(i, i + BATCH_SIZE);
                const valueStrings = [];
                const queryParams: any[] = [];
                let paramIndex = 1;
                for (const feature of chunk) {
                    if (!feature.geometry) continue;
                    const { name, code } = this.extractFeatureProps(feature);
                    const department = (feature.properties?.department || feature.properties?.departement || null) as string | null;
                    const geomJson = JSON.stringify(feature.geometry);
                    
                    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, ST_Multi(ST_GeomFromGeoJSON($${paramIndex + 3})))`);
                    queryParams.push(name, code, department, geomJson);
                    paramIndex += 4;
                }
                if (valueStrings.length > 0) {
                    await client.query(`INSERT INTO temp_municipalities (name, code, department, geom) VALUES ${valueStrings.join(', ')}`, queryParams);
                }
            }

            await client.query(`
                UPDATE municipalities m
                SET geometry = t.geom, 
                    department = COALESCE(m.department, t.department),
                    region_id = COALESCE(m.region_id, (SELECT r.id FROM regions r WHERE ST_Intersects(r.geometry, ST_Centroid(t.geom)) LIMIT 1))
                FROM temp_municipalities t
                WHERE m.code = t.code AND t.code IS NOT NULL
            `);

            await client.query(`
                UPDATE municipalities m
                SET geometry = t.geom, 
                    code = COALESCE(m.code, t.code),
                    department = COALESCE(m.department, t.department),
                    region_id = COALESCE(m.region_id, (SELECT r.id FROM regions r WHERE ST_Intersects(r.geometry, ST_Centroid(t.geom)) LIMIT 1))
                FROM temp_municipalities t
                WHERE LOWER(m.name) = LOWER(t.name)
                AND NOT EXISTS (SELECT 1 FROM municipalities m2 WHERE m2.code = t.code AND t.code IS NOT NULL)
            `);

            await client.query(`
                INSERT INTO municipalities (name, code, department, geometry, region_id)
                SELECT t.name, t.code, t.department, t.geom, 
                       (SELECT r.id FROM regions r WHERE ST_Intersects(r.geometry, ST_Centroid(t.geom)) LIMIT 1)
                FROM temp_municipalities t
                WHERE NOT EXISTS (SELECT 1 FROM municipalities m WHERE m.code = t.code AND t.code IS NOT NULL)
                AND NOT EXISTS (SELECT 1 FROM municipalities m WHERE LOWER(m.name) = LOWER(t.name))
            `);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error in upsertMunicipalities:', error);
            throw new BadRequestError('Erreur lors de la mise à jour des communes via SIG');
        } finally {
            client.release();
        }
    }

    async upsertDistricts(features: GeoJsonFeature[]): Promise<void> {
        if (features.length === 0) return;
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            await client.query(`
                CREATE TEMP TABLE IF NOT EXISTS temp_districts (
                    name VARCHAR(255),
                    code VARCHAR(50),
                    geom GEOMETRY
                ) ON COMMIT DROP;
            `);

            const BATCH_SIZE = 500;
            for (let i = 0; i < features.length; i += BATCH_SIZE) {
                const chunk = features.slice(i, i + BATCH_SIZE);
                const valueStrings = [];
                const queryParams: any[] = [];
                let paramIndex = 1;
                for (const feature of chunk) {
                    if (!feature.geometry) continue;
                    const { name, code } = this.extractFeatureProps(feature);
                    const geomJson = JSON.stringify(feature.geometry);
                    
                    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, ST_Multi(ST_GeomFromGeoJSON($${paramIndex + 2})))`);
                    queryParams.push(name, code, geomJson);
                    paramIndex += 3;
                }
                if (valueStrings.length > 0) {
                    await client.query(`INSERT INTO temp_districts (name, code, geom) VALUES ${valueStrings.join(', ')}`, queryParams);
                }
            }

            await client.query(`
                UPDATE districts d
                SET geometry = t.geom,
                    municipality_id = COALESCE(d.municipality_id, (SELECT m.id FROM municipalities m WHERE ST_Intersects(m.geometry, ST_Centroid(t.geom)) LIMIT 1))
                FROM temp_districts t
                WHERE d.code = t.code AND t.code IS NOT NULL
            `);

            await client.query(`
                UPDATE districts d
                SET geometry = t.geom, 
                    code = COALESCE(d.code, t.code),
                    municipality_id = COALESCE(d.municipality_id, (SELECT m.id FROM municipalities m WHERE ST_Intersects(m.geometry, ST_Centroid(t.geom)) LIMIT 1))
                FROM temp_districts t
                WHERE LOWER(d.name) = LOWER(t.name)
                AND NOT EXISTS (SELECT 1 FROM districts d2 WHERE d2.code = t.code AND t.code IS NOT NULL)
            `);

            await client.query(`
                INSERT INTO districts (name, code, geometry, municipality_id)
                SELECT t.name, t.code, t.geom, 
                       (SELECT m.id FROM municipalities m WHERE ST_Intersects(m.geometry, ST_Centroid(t.geom)) LIMIT 1)
                FROM temp_districts t
                WHERE NOT EXISTS (SELECT 1 FROM districts d WHERE d.code = t.code AND t.code IS NOT NULL)
                AND NOT EXISTS (SELECT 1 FROM districts d WHERE LOWER(d.name) = LOWER(t.name))
            `);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error in upsertDistricts:', error);
            throw new BadRequestError('Erreur lors de la mise à jour des arrondissements via SIG');
        } finally {
            client.release();
        }
    }

    async upsertNeighborhoods(features: GeoJsonFeature[]): Promise<void> {
        if (features.length === 0) return;
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            await client.query(`
                CREATE TEMP TABLE IF NOT EXISTS temp_neighborhoods (
                    name VARCHAR(255),
                    code VARCHAR(50),
                    geom GEOMETRY
                ) ON COMMIT DROP;
            `);

            const BATCH_SIZE = 500;
            for (let i = 0; i < features.length; i += BATCH_SIZE) {
                const chunk = features.slice(i, i + BATCH_SIZE);
                const valueStrings = [];
                const queryParams: any[] = [];
                let paramIndex = 1;
                for (const feature of chunk) {
                    if (!feature.geometry) continue;
                    const { name, code } = this.extractFeatureProps(feature);
                    const geomJson = JSON.stringify(feature.geometry);
                    
                    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, ST_Multi(ST_GeomFromGeoJSON($${paramIndex + 2})))`);
                    queryParams.push(name, code, geomJson);
                    paramIndex += 3;
                }
                if (valueStrings.length > 0) {
                    await client.query(`INSERT INTO temp_neighborhoods (name, code, geom) VALUES ${valueStrings.join(', ')}`, queryParams);
                }
            }

            await client.query(`
                UPDATE neighborhoods n
                SET geometry = t.geom,
                    district_id = COALESCE(n.district_id, (SELECT d.id FROM districts d WHERE ST_Intersects(d.geometry, ST_Centroid(t.geom)) LIMIT 1))
                FROM temp_neighborhoods t
                WHERE n.code = t.code AND t.code IS NOT NULL
            `);

            await client.query(`
                UPDATE neighborhoods n
                SET geometry = t.geom, 
                    code = COALESCE(n.code, t.code),
                    district_id = COALESCE(n.district_id, (SELECT d.id FROM districts d WHERE ST_Intersects(d.geometry, ST_Centroid(t.geom)) LIMIT 1))
                FROM temp_neighborhoods t
                WHERE LOWER(n.name) = LOWER(t.name)
                AND NOT EXISTS (SELECT 1 FROM neighborhoods n2 WHERE n2.code = t.code AND t.code IS NOT NULL)
            `);

            await client.query(`
                INSERT INTO neighborhoods (name, code, geometry, district_id)
                SELECT t.name, t.code, t.geom, 
                       (SELECT d.id FROM districts d WHERE ST_Intersects(d.geometry, ST_Centroid(t.geom)) LIMIT 1)
                FROM temp_neighborhoods t
                WHERE NOT EXISTS (SELECT 1 FROM neighborhoods n WHERE n.code = t.code AND t.code IS NOT NULL)
                AND NOT EXISTS (SELECT 1 FROM neighborhoods n WHERE LOWER(n.name) = LOWER(t.name))
            `);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Error in upsertNeighborhoods:', error);
            throw new BadRequestError('Erreur lors de la mise à jour des quartiers via SIG');
        } finally {
            client.release();
        }
    }
}
