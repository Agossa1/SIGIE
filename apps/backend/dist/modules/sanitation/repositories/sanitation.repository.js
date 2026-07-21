"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitationRepository = void 0;
class SanitationRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getWastePoints(municipalityId, page = 1, limit = 20) {
        let conditions = 'WHERE deleted_at IS NULL';
        const params = [];
        let idx = 1;
        if (municipalityId) {
            conditions += ` AND municipality_id = $${idx++}`;
            params.push(municipalityId);
        }
        const offset = (page - 1) * limit;
        const result = await this.db.query(`SELECT * FROM waste_points ${conditions} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
        return result.rows;
    }
    async createWastePoint(data) {
        const result = await this.db.query(`INSERT INTO waste_points (id, name, municipality_id, location, waste_type) VALUES (gen_random_uuid(), $1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5) RETURNING *`, [data.name, data.municipalityId, data.latitude, data.longitude, data.wasteType]);
        return result.rows[0];
    }
    async getCollections(municipalityId, status, page = 1, limit = 20) {
        let conditions = '';
        const params = [];
        let idx = 1;
        if (municipalityId) {
            conditions = `WHERE municipality_id = $${idx++}`;
            params.push(municipalityId);
        }
        if (status) {
            conditions += (conditions ? ' AND' : 'WHERE') + ` status = $${idx++}`;
            params.push(status);
        }
        const offset = (page - 1) * limit;
        const result = await this.db.query(`SELECT * FROM waste_collections ${conditions} ORDER BY collection_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
        return result.rows;
    }
    async createCollection(data) {
        const result = await this.db.query(`INSERT INTO waste_collections (id, municipality_id, collection_date, volume_collected_m3, team_id) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`, [data.municipalityId, data.collectionDate, data.volumeCollected, data.teamId]);
        return result.rows[0];
    }
    async getCampaigns(municipalityId, page = 1, limit = 20) {
        let sql = 'SELECT * FROM sanitation_campaigns WHERE deleted_at IS NULL';
        const params = [];
        let idx = 1;
        if (municipalityId) {
            sql += ` AND municipality_id = $${idx++}`;
            params.push(municipalityId);
        }
        const offset = (page - 1) * limit;
        const result = await this.db.query(`${sql} ORDER BY start_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
        return result.rows;
    }
}
exports.SanitationRepository = SanitationRepository;
//# sourceMappingURL=sanitation.repository.js.map