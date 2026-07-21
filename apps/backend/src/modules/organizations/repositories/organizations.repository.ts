import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';

export interface Organization {
    id: string;
    name: string;
    type: string;
    municipalityId?: string;
    regionId?: string;
    createdAt: string;
    updatedAt: string;
}

export class OrganizationsRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getAll(): Promise<Organization[]> {
        const result = await this.db.query(
            'SELECT id, name, type, municipality_id as "municipalityId", region_id as "regionId", created_at as "createdAt", updated_at as "updatedAt" FROM organizations WHERE deleted_at IS NULL ORDER BY name'
        );
        return result.rows;
    }

    async getById(id: string): Promise<Organization | null> {
        const result = await this.db.query(
            'SELECT id, name, type, municipality_id as "municipalityId", region_id as "regionId", created_at as "createdAt", updated_at as "updatedAt" FROM organizations WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        return result.rows[0] || null;
    }

    async create(data: { name: string; type: string; municipalityId?: string; regionId?: string }): Promise<Organization> {
        const result = await this.db.query(
            `INSERT INTO organizations (id, name, type, municipality_id, region_id, created_at, updated_at) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
            [data.name, data.type, data.municipalityId || null, data.regionId || null]
        );
        return result.rows[0];
    }

    async update(id: string, data: { name?: string; type?: string }): Promise<Organization | null> {
        const updates: string[] = [];
        const params: any[] = [];
        let idx = 1;
        if (data.name !== undefined) { updates.push(`name = $${idx++}`); params.push(data.name); }
        if (data.type !== undefined) { updates.push(`type = $${idx++}`); params.push(data.type); }
        if (updates.length === 0) return this.getById(id);
        updates.push('updated_at = NOW()');
        params.push(id);
        const result = await this.db.query(
            `UPDATE organizations SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
            params
        );
        return result.rows[0] || null;
    }

    async softDelete(id: string): Promise<boolean> {
        const result = await this.db.query('UPDATE organizations SET deleted_at = NOW() WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
}