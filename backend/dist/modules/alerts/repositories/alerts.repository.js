"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsRepository = void 0;
class AlertsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getAll(filters) {
        const conditions = ['deleted_at IS NULL'];
        const params = [];
        let idx = 1;
        if (filters.type) {
            conditions.push(`alert_type = $${idx++}`);
            params.push(filters.type);
        }
        if (filters.severity) {
            conditions.push(`severity = $${idx++}`);
            params.push(filters.severity);
        }
        if (filters.municipalityId) {
            conditions.push(`municipality_id = $${idx++}`);
            params.push(filters.municipalityId);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const offset = (page - 1) * limit;
        const result = await this.db.query(`SELECT * FROM alerts WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]);
        return result.rows;
    }
    async create(data) {
        const result = await this.db.query(`INSERT INTO alerts (id, title, description, alert_type, severity, municipality_id, region_id, valid_until, created_by, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`, [data.title, data.description || null, data.alertType, data.severity || 'info', data.municipalityId || null, data.regionId || null, data.validUntil || null, data.userId]);
        return result.rows[0];
    }
    async acknowledge(id, userId) {
        const result = await this.db.query(`UPDATE alerts SET acknowledged_by = $1, acknowledged_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`, [userId, id]);
        return result.rows[0] || null;
    }
}
exports.AlertsRepository = AlertsRepository;
//# sourceMappingURL=alerts.repository.js.map