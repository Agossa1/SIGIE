import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';
import type { InfrastructureItem, InfrastructureFilters, PaginatedInfrastructureResponse } from '../types/infrastructure.types';

export class InfrastructureRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getAll(filters: InfrastructureFilters, page: number, limit: number): Promise<PaginatedInfrastructureResponse> {
        const conditions: string[] = ['deleted_at IS NULL'];
        const params: any[] = [];
        let idx = 1;
        if (filters.type) { conditions.push(`infrastructure_type = $${idx++}`); params.push(filters.type); }
        if (filters.municipalityId) { conditions.push(`municipality_id = $${idx++}`); params.push(filters.municipalityId); }
        if (filters.status) { conditions.push(`condition_status = $${idx++}`); params.push(filters.status); }
        const where = `WHERE ${conditions.join(' AND ')}`;
        const offset = (page - 1) * limit;

        const [{ rows: items }, { rows: countRows }] = await Promise.all([
            this.db.query(`SELECT * FROM infrastructure ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]),
            this.db.query(`SELECT count(*) FROM infrastructure ${where}`, params),
        ]);
        const total = parseInt(countRows[0].count, 10);
        return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getById(id: string): Promise<InfrastructureItem | null> {
        const result = await this.db.query(`SELECT * FROM infrastructure WHERE id = $1 AND deleted_at IS NULL`, [id]);
        return result.rows[0] || null;
    }

    async create(data: {
        name: string; infrastructureType: string; description?: string;
        municipalityId?: string; conditionStatus?: string;
        latitude?: number; longitude?: number; userId?: string;
    }): Promise<InfrastructureItem> {
        const result = await this.db.query(`
            INSERT INTO infrastructure (id, name, infrastructure_type, description, municipality_id, condition_status, location, created_by, created_at, updated_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($7, $6), 4326), $8, NOW(), NOW()) RETURNING *`,
            [data.name, data.infrastructureType, data.description, data.municipalityId, data.conditionStatus || 'good', data.latitude, data.longitude, data.userId]
        );
        return result.rows[0];
    }

    async update(id: string, data: {
        name?: string; description?: string; conditionStatus?: string;
        latitude?: number; longitude?: number;
    }): Promise<InfrastructureItem | null> {
        const updates: string[] = ['updated_at = NOW()'];
        const params: any[] = [];
        let idx = 1;
        if (data.name !== undefined) { updates.push(`name = $${idx++}`); params.push(data.name); }
        if (data.description !== undefined) { updates.push(`description = $${idx++}`); params.push(data.description); }
        if (data.conditionStatus !== undefined) { updates.push(`condition_status = $${idx++}`); params.push(data.conditionStatus); }
        if (data.latitude !== undefined && data.longitude !== undefined) {
            updates.push(`location = ST_SetSRID(ST_MakePoint($${idx + 1}, $${idx}), 4326)`);
            params.push(data.latitude, data.longitude);
            idx += 2;
        }
        params.push(id);
        const result = await this.db.query(`UPDATE infrastructure SET ${updates.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`, params);
        return result.rows[0] || null;
    }

    async softDelete(id: string): Promise<void> {
        await this.db.query(`UPDATE infrastructure SET deleted_at = NOW() WHERE id = $1`, [id]);
    }
}