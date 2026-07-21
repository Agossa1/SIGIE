import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';

export interface Region {
    id: string;
    code: string;
    name: string;
}

export interface Municipality {
    id: string;
    code: string;
    name: string;
    regionId: string;
}

export interface District {
    id: string;
    code: string;
    name: string;
    municipalityId: string;
}

export interface Neighborhood {
    id: string;
    code: string;
    name: string;
    districtId: string;
}

export class TerritoryRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getRegions(): Promise<Region[]> {
        const result = await this.db.query('SELECT id, code, name FROM regions ORDER BY name');
        return result.rows;
    }

    async getMunicipalities(regionId?: string): Promise<Municipality[]> {
        let sql = 'SELECT id, code, name, region_id as "regionId" FROM municipalities';
        const params: string[] = [];
        if (regionId) { sql += ' WHERE region_id = $1'; params.push(regionId); }
        sql += ' ORDER BY name';
        const result = await this.db.query(sql, params);
        return result.rows;
    }

    async getDistricts(municipalityId?: string): Promise<District[]> {
        let sql = 'SELECT id, code, name, municipality_id as "municipalityId" FROM districts';
        const params: string[] = [];
        if (municipalityId) { sql += ' WHERE municipality_id = $1'; params.push(municipalityId); }
        sql += ' ORDER BY name';
        const result = await this.db.query(sql, params);
        return result.rows;
    }

    async getNeighborhoods(districtId?: string): Promise<Neighborhood[]> {
        let sql = 'SELECT id, code, name, district_id as "districtId" FROM neighborhoods';
        const params: string[] = [];
        if (districtId) { sql += ' WHERE district_id = $1'; params.push(districtId); }
        sql += ' ORDER BY name LIMIT 200';
        const result = await this.db.query(sql, params);
        return result.rows;
    }
}