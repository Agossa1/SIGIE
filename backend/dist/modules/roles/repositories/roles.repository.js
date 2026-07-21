"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesRepository = void 0;
class RolesRepository {
    constructor(db) {
        this.db = db;
    }
    async findAll() {
        const query = `
            SELECT id, code, name, description, tier, route_prefix, 
                   dashboard_path, page_ids, can_manage_users, can_manage_roles, created_at
            FROM roles
            ORDER BY created_at ASC
        `;
        const result = await this.db.query(query);
        return result.rows;
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let index = 1;
        if (data.name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${index++}`);
            values.push(data.description);
        }
        if (data.page_ids !== undefined) {
            fields.push(`page_ids = $${index++}`);
            values.push(data.page_ids);
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const query = `
            UPDATE roles 
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING id, code, name, description, tier, route_prefix, dashboard_path, page_ids, can_manage_users, can_manage_roles, created_at
        `;
        const result = await this.db.query(query, values);
        return result.rows[0] || null;
    }
}
exports.RolesRepository = RolesRepository;
//# sourceMappingURL=roles.repository.js.map