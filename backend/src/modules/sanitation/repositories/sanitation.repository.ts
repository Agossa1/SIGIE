import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';
import type { WastePoint, WasteCollection, SanitationCampaign } from '../types/sanitation.types';

export class SanitationRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getWastePoints(municipalityId?: string, page: number = 1, limit: number = 20): Promise<WastePoint[]> {
        let conditions = 'WHERE deleted_at IS NULL';
        const params: any[] = [];
        let idx = 1;
        if (municipalityId) { conditions += ` AND municipality_id = $${idx++}`; params.push(municipalityId); }
        const offset = (page - 1) * limit;
        const result = await this.db.query(
            `SELECT * FROM waste_points ${conditions} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limit, offset]
        );
        return result.rows;
    }

    async createWastePoint(data: { name: string; municipalityId?: string; latitude?: number; longitude?: number; wasteType?: string }): Promise<WastePoint> {
        const result = await this.db.query(
            `INSERT INTO waste_points (id, name, municipality_id, location, waste_type) VALUES (gen_random_uuid(), $1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5) RETURNING *`,
            [data.name, data.municipalityId, data.latitude, data.longitude, data.wasteType]
        );
        return result.rows[0];
    }

    async getCollections(municipalityId?: string, status?: string, page: number = 1, limit: number = 20): Promise<WasteCollection[]> {
        let conditions = '';
        const params: any[] = [];
        let idx = 1;
        if (municipalityId) { conditions = `WHERE municipality_id = $${idx++}`; params.push(municipalityId); }
        if (status) { conditions += (conditions ? ' AND' : 'WHERE') + ` status = $${idx++}`; params.push(status); }
        const offset = (page - 1) * limit;
        const result = await this.db.query(
            `SELECT * FROM waste_collections ${conditions} ORDER BY collection_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limit, offset]
        );
        return result.rows;
    }

    async createCollection(data: { municipalityId?: string; collectionDate: string; volumeCollected?: number; teamId?: string }): Promise<WasteCollection> {
        const result = await this.db.query(
            `INSERT INTO waste_collections (id, municipality_id, collection_date, volume_collected_m3, team_id) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
            [data.municipalityId, data.collectionDate, data.volumeCollected, data.teamId]
        );
        return result.rows[0];
    }

    async getCampaigns(municipalityId?: string, page: number = 1, limit: number = 20): Promise<SanitationCampaign[]> {
        let sql = 'SELECT * FROM sanitation_campaigns WHERE deleted_at IS NULL';
        const params: any[] = [];
        let idx = 1;
        if (municipalityId) { sql += ` AND municipality_id = $${idx++}`; params.push(municipalityId); }
        const offset = (page - 1) * limit;
        const result = await this.db.query(
            `${sql} ORDER BY start_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limit, offset]
        );
        return result.rows;
    }
}