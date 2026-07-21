import type { Logger } from 'winston';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import redisClient from '../../../../apps/backend/src/config/redis/redisConfig';
import type {
    GisLayer,
    GisFeature,
    GeoJsonFeature,
    GeoJsonFeatureCollection,
    UpdateGisLayerDTO,
} from '../types/gis.types';

export class GisRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) {}

    async createLayer(params: {
        name: string;
        layerType: string;
        description?: string;
        municipalityId?: string;
        createdBy?: string;
    }): Promise<string> {
        try {
            const sql = `
                INSERT INTO gis_layers (municipality_id, name, layer_type, description, created_by)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            `;
            const result = await this.db.query(sql, [
                params.municipalityId ?? null,
                params.name,
                params.layerType,
                params.description ?? null,
                params.createdBy ?? null,
            ]);
            return result.rows[0].id;
        } catch (error) {
            this.logger.error('GisRepository.createLayer error:', error);
            throw new BadRequestError('Erreur lors de la création de la couche SIG');
        }
    }

    async insertFeatures(layerId: string, features: GeoJsonFeature[]): Promise<void> {
        if (features.length === 0) return;
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            
            const BATCH_SIZE = 500;
            for (let i = 0; i < features.length; i += BATCH_SIZE) {
                const chunk = features.slice(i, i + BATCH_SIZE);
                
                const valueStrings = [];
                const queryParams: any[] = [];
                
                let paramIndex = 1;
                for (const feature of chunk) {
                    if (!feature.geometry) continue;
                    
                    const geometryJson = JSON.stringify(feature.geometry);
                    const properties = feature.properties ?? {};
                    const featureType = feature.geometry?.type ?? 'unknown';
                    const title = (properties.name ?? properties.label ?? properties.nom ?? null) as string | null;
                    const description = (properties.description ?? null) as string | null;
                    
                    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, ST_GeomFromGeoJSON($${paramIndex + 4}), $${paramIndex + 5})`);
                    queryParams.push(
                        layerId,
                        featureType,
                        title,
                        description,
                        geometryJson,
                        JSON.stringify(properties)
                    );
                    
                    paramIndex += 6;
                }
                
                if (valueStrings.length > 0) {
                    const sql = `INSERT INTO gis_features (layer_id, feature_type, title, description, geometry, properties) VALUES ${valueStrings.join(', ')}`;
                    await client.query(sql, queryParams);
                }
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('GisRepository.insertFeatures error:', error);
            throw new BadRequestError('Erreur lors de l\'import des features GIS');
        } finally {
            client.release();
        }
    }

    async getLayers(): Promise<GisLayer[]> {
        try {
            const sql = `
                SELECT
                    l.id,
                    l.municipality_id as "municipalityId",
                    l.name,
                    l.layer_type as "layerType",
                    l.description,
                    l.created_by as "createdBy",
                    l.created_at as "createdAt",
                    COUNT(f.id)::int as "featureCount"
                FROM gis_layers l
                LEFT JOIN gis_features f ON f.layer_id = l.id
                GROUP BY l.id
                ORDER BY l.created_at DESC
            `;
            const result = await this.db.query(sql, []);
            return result.rows;
        } catch (error) {
            this.logger.error('GisRepository.getLayers error:', error);
            throw new BadRequestError('Erreur lors de la récupération des couches SIG');
        }
    }

    async getLayerAsGeoJson(
        layerId: string,
        options?: {
            limit?: number;
            offset?: number;
            bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
        }
    ): Promise<GeoJsonFeatureCollection | null> {
        const limit = options?.limit ?? 5000;
        const offset = options?.offset ?? 0;
        const bbox = options?.bbox;

        // Clé de cache incluant les paramètres de pagination/bbox
        const cacheKey = bbox
            ? `gis_layer_geojson:${layerId}:${limit}:${offset}:${bbox.join(',')}`
            : `gis_layer_geojson:${layerId}:${limit}:${offset}`;

        // Uniquement mettre en cache la première page sans bbox (données complètes)
        const shouldCache = !bbox && offset === 0;

        try {
            // 1. Tenter de récupérer depuis le cache Redis
            if (shouldCache && redisClient.isOpen) {
                const cachedData = await redisClient.get(cacheKey);
                if (cachedData) {
                    this.logger.info(`[GIS Cache HIT] layer=${layerId} limit=${limit}`);
                    return JSON.parse(cachedData) as GeoJsonFeatureCollection;
                }
            }
        } catch (error) {
            this.logger.warn(`Redis GET error for key ${cacheKey}`, error);
        }

        try {
            const layerResult = await this.db.query(
                `SELECT id FROM gis_layers WHERE id = $1`,
                [layerId]
            );
            if (layerResult.rowCount === 0) return null;

            const queryParams: any[] = [layerId];
            let bboxClause = '';
            if (bbox) {
                const [minLng, minLat, maxLng, maxLat] = bbox;
                bboxClause = `AND geometry && ST_MakeEnvelope($2, $3, $4, $5, 4326)`;
                queryParams.push(minLng, minLat, maxLng, maxLat);
            }

            const limitParam = queryParams.length + 1;
            const offsetParam = queryParams.length + 2;
            queryParams.push(limit, offset);

            const sql = `
                SELECT
                    id,
                    feature_type as "featureType",
                    title,
                    description,
                    severity_level as "severityLevel",
                    ST_AsGeoJSON(geometry)::json as geometry,
                    properties
                FROM gis_features
                WHERE layer_id = $1
                ${bboxClause}
                ORDER BY id
                LIMIT $${limitParam} OFFSET $${offsetParam}
            `;
            const result = await this.db.query(sql, queryParams);

            this.logger.info(`[GIS] layer=${layerId} fetched=${result.rows.length} limit=${limit} offset=${offset}`);

            const geoJsonData: GeoJsonFeatureCollection = {
                type: 'FeatureCollection',
                features: result.rows.map((row: any) => ({
                    type: 'Feature',
                    geometry: row.geometry,
                    properties: {
                        id: row.id,
                        featureType: row.featureType,
                        title: row.title,
                        description: row.description,
                        severityLevel: row.severityLevel,
                        ...(row.properties ?? {}),
                    },
                })),
            };

            // 2. Mettre en cache uniquement la première page (sans bbox)
            try {
                if (shouldCache && redisClient.isOpen) {
                    await redisClient.setEx(cacheKey, 86400, JSON.stringify(geoJsonData));
                }
            } catch (error) {
                this.logger.warn(`Redis SET error for key ${cacheKey}`, error);
            }

            return geoJsonData;
        } catch (error) {
            this.logger.error('GisRepository.getLayerAsGeoJson error:', error);
            throw new BadRequestError('Erreur lors de la récupération des données GeoJSON');
        }
    }

    async deleteLayer(layerId: string): Promise<void> {
        try {
            await this.db.query(`DELETE FROM gis_layers WHERE id = $1`, [layerId]);
            
            // Invalider le cache
            const cacheKey = `gis_layer_geojson:${layerId}`;
            if (redisClient.isOpen) {
                await redisClient.del(cacheKey).catch(e => this.logger.warn('Failed to delete cache', e));
            }
        } catch (error) {
            this.logger.error('GisRepository.deleteLayer error:', error);
            throw new BadRequestError('Erreur lors de la suppression de la couche');
        }
    }
    async updateGisLayer(layerId: string, dto: UpdateGisLayerDTO, userRoles: string[]): Promise<GisLayer> {
        let client;
        try {
            client = await this.db.getClient();
            await client.query('BEGIN');

            const updateFields = [];
            const queryParams: any[] = [];
            let paramIndex = 1;

            if (dto.name !== undefined) {
                updateFields.push(`name = $${paramIndex++}`);
                queryParams.push(dto.name);
            }
            if (dto.layerType !== undefined) {
                updateFields.push(`layer_type = $${paramIndex++}`);
                queryParams.push(dto.layerType);
            }
            if (dto.description !== undefined) {
                updateFields.push(`description = $${paramIndex++}`);
                queryParams.push(dto.description);
            }
            if (dto.municipalityId !== undefined) {
                updateFields.push(`municipality_id = $${paramIndex++}`);
                queryParams.push(dto.municipalityId);
            }

            if (updateFields.length > 0) {
                queryParams.push(layerId);
                const sql = `
                    UPDATE gis_layers 
                    SET ${updateFields.join(', ')} 
                    WHERE id = $${paramIndex}
                `;
                await client.query(sql, queryParams);
            }

            // Si geojson est fourni, on supprime les features existantes pour les remplacer
            if (dto.geojson && dto.geojson.features) {
                await client.query('DELETE FROM gis_features WHERE layer_id = $1', [layerId]);
            }

            await client.query('COMMIT');
        } catch (error) {
            if (client) await client.query('ROLLBACK');
            this.logger.error('GisRepository.updateGisLayer error:', error);
            throw new BadRequestError('Erreur lors de la mise à jour de la couche SIG');
        } finally {
            if (client) client.release();
        }

        // Insérer les nouvelles features hors de la transaction principale
        if (dto.geojson && dto.geojson.features) {
            await this.insertFeatures(layerId, dto.geojson.features);
        }

        // Invalider le cache
        if (redisClient.isOpen) {
            try {
                const keys = await redisClient.keys(`gis_layer_geojson:${layerId}*`);
                if (keys.length > 0) {
                    await redisClient.del(keys);
                }
            } catch (e) {
                this.logger.warn('Failed to delete cache keys', e);
            }
        }

        const layers = await this.getLayers();
        return layers.find(l => l.id === layerId) as GisLayer;
    }
}
