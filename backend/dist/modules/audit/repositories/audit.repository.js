"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
class AuditRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getAll(filters, page, limit) {
        try {
            const conditions = [];
            const params = [];
            let idx = 1;
            if (filters.userId) {
                conditions.push(`user_id = $${idx++}`);
                params.push(filters.userId);
            }
            if (filters.action) {
                conditions.push(`action = $${idx++}`);
                params.push(filters.action);
            }
            if (filters.tableName) {
                conditions.push(`table_name = $${idx++}`);
                params.push(filters.tableName);
            }
            if (filters.from) {
                conditions.push(`created_at >= $${idx++}`);
                params.push(filters.from);
            }
            if (filters.to) {
                conditions.push(`created_at <= $${idx++}`);
                params.push(filters.to);
            }
            const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const offset = (page - 1) * limit;
            const [{ rows: items }, { rows: countRows }] = await Promise.all([
                this.db.query(`SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]),
                this.db.query(`SELECT count(*) FROM audit_logs ${where}`, params),
            ]);
            const total = parseInt(countRows[0].count, 10);
            return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) };
        }
        catch (error) {
            this.logger.error('Error fetching audit logs:', error);
            throw error;
        }
    }
}
exports.AuditRepository = AuditRepository;
//# sourceMappingURL=audit.repository.js.map