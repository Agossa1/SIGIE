"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GisRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redisConfig_1 = __importDefault(require("../../../config/redis/redisConfig"));
class GisRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async createLayer(params) {
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
        }
        catch (error) {
            this.logger.error('GisRepository.createLayer error:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la création de la couche SIG');
        }
    }
    async insertFeatures(layerId, features) {
        if (features.length === 0)
            return;
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const BATCH_SIZE = 500;
            for (let i = 0; i < features.length; i += BATCH_SIZE) {
                const chunk = features.slice(i, i + BATCH_SIZE);
                const valueStrings = [];
                const queryParams = [];
                let paramIndex = 1;
                for (const feature of chunk) {
                    if (!feature.geometry)
                        continue;
                    const geometryJson = JSON.stringify(feature.geometry);
                    const properties = feature.properties ?? {};
                    const featureType = feature.geometry?.type ?? 'unknown';
                    const title = (properties.name ?? properties.label ?? properties.nom ?? null);
                    const description = (properties.description ?? null);
                    valueStrings.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, ST_GeomFromGeoJSON($${paramIndex + 4}), $${paramIndex + 5})`);
                    queryParams.push(layerId, featureType, title, description, geometryJson, JSON.stringify(properties));
                    paramIndex += 6;
                }
                if (valueStrings.length > 0) {
                    const sql = `INSERT INTO gis_features (layer_id, feature_type, title, description, geometry, properties) VALUES ${valueStrings.join(', ')}`;
                    await client.query(sql, queryParams);
                }
            }
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('GisRepository.insertFeatures error:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de l\'import des features GIS');
        }
        finally {
            client.release();
        }
    }
    async getLayers() {
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
        }
        catch (error) {
            this.logger.error('GisRepository.getLayers error:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération des couches SIG');
        }
    }
    async getLayerAsGeoJson(layerId) {
        const cacheKey = `gis_layer_geojson:${layerId}`;
        try {
            // 1. Tenter de récupérer depuis le cache Redis
            if (redisConfig_1.default.isOpen) {
                const cachedData = await redisConfig_1.default.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            }
        }
        catch (error) {
            this.logger.warn(`Redis GET error for key ${cacheKey}`, error);
        }
        try {
            const layerResult = await this.db.query(`SELECT id FROM gis_layers WHERE id = $1`, [layerId]);
            if (layerResult.rowCount === 0)
                return null;
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
            `;
            const result = await this.db.query(sql, [layerId]);
            const geoJsonData = {
                type: 'FeatureCollection',
                features: result.rows.map((row) => ({
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
            // 2. Mettre en cache pour la prochaine fois
            try {
                if (redisConfig_1.default.isOpen) {
                    // On peut garder en cache pour longtemps (par ex 24h), la suppression de couche l'invalidera
                    await redisConfig_1.default.setEx(cacheKey, 86400, JSON.stringify(geoJsonData));
                }
            }
            catch (error) {
                this.logger.warn(`Redis SET error for key ${cacheKey}`, error);
            }
            return geoJsonData;
        }
        catch (error) {
            this.logger.error('GisRepository.getLayerAsGeoJson error:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la récupération des données GeoJSON');
        }
    }
    async deleteLayer(layerId) {
        try {
            await this.db.query(`DELETE FROM gis_layers WHERE id = $1`, [layerId]);
            // Invalider le cache
            const cacheKey = `gis_layer_geojson:${layerId}`;
            if (redisConfig_1.default.isOpen) {
                await redisConfig_1.default.del(cacheKey).catch(e => this.logger.warn('Failed to delete cache', e));
            }
        }
        catch (error) {
            this.logger.error('GisRepository.deleteLayer error:', error);
            throw new appErrors_1.BadRequestError('Erreur lors de la suppression de la couche');
        }
    }
}
exports.GisRepository = GisRepository;
//# sourceMappingURL=gis.repositories.js.map