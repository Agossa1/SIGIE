import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { RoleRecord } from '../types/roles.types';

export class RolesRepository {
    constructor(private readonly db: PostgresDatabase) {}

    async findAll(): Promise<RoleRecord[]> {
        const query = `
            SELECT id, code, name, description, tier, route_prefix, 
                   dashboard_path, page_ids, can_manage_users, can_manage_roles, created_at
            FROM roles
            ORDER BY created_at ASC
        `;
        const result = await this.db.query<RoleRecord>(query);
        return result.rows;
    }

    async update(id: string, data: Partial<RoleRecord>): Promise<RoleRecord | null> {
        const fields: string[] = [];
        const values: any[] = [];
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
        
        if (fields.length === 0) return null;

        values.push(id);
        const query = `
            UPDATE roles 
            SET ${fields.join(', ')}
            WHERE id = $${index}
            RETURNING id, code, name, description, tier, route_prefix, dashboard_path, page_ids, can_manage_users, can_manage_roles, created_at
        `;
        const result = await this.db.query<RoleRecord>(query, values);
        return result.rows[0] || null;
    }
}
