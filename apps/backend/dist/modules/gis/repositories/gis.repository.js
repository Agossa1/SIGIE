"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GisRepository = void 0;
class GisRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getAllLayers() {
        const result = await this.db.query(`
            SELECT id, name, layer_type as "layerType", description, 
                   municipality_id as "municipalityId", created_by as "createdBy",
                   created_at as "createdAt"
            FROM gis_layers
            ORDER BY created_at DESC
        `);
        return result.rows;
    }
    async getLayerWithFeatures(id) {
        const layerResult = await this.db.query('SELECT id, name FROM gis_layers WHERE id = $1', [id]);
        if (layerResult.rows.length === 0)
            return null;
        const featuresResult = await this.db.query('SELECT feature_data as "featureData" FROM gis_features WHERE layer_id = $1 ORDER BY id', [id]);
        return {
            layer: layerResult.rows[0],
            features: featuresResult.rows,
        };
    }
    async createLayer(data) {
        const layerResult = await this.db.query(`
            INSERT INTO gis_layers (id, name, layer_type, description, municipality_id, created_by, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
            RETURNING id
        `, [data.name, data.layerType, data.description || null, data.municipalityId || null, data.userId || null]);
        const layerId = layerResult.rows[0].id;
        let featureCount = 0;
        if (data.geojson.features && data.geojson.features.length > 0) {
            const values = [];
            const params = [];
            data.geojson.features.forEach((feature, i) => {
                const base = i * 2;
                values.push(`($${base + 1}, $${base + 2})`);
                params.push(layerId, JSON.stringify(feature));
            });
            await this.db.query(`INSERT INTO gis_features (layer_id, feature_data) VALUES ${values.join(', ')}`, params);
            featureCount = data.geojson.features.length;
        }
        return { layerId, featureCount };
    }
    async deleteLayer(id) {
        await this.db.query('DELETE FROM gis_layers WHERE id = $1', [id]);
    }
}
exports.GisRepository = GisRepository;
//# sourceMappingURL=gis.repository.js.map