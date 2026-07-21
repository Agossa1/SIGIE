"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryRepository = void 0;
class TerritoryRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getRegions() {
        const result = await this.db.query('SELECT id, code, name FROM regions ORDER BY name');
        return result.rows;
    }
    async getMunicipalities(regionId) {
        let sql = 'SELECT id, code, name, region_id as "regionId" FROM municipalities';
        const params = [];
        if (regionId) {
            sql += ' WHERE region_id = $1';
            params.push(regionId);
        }
        sql += ' ORDER BY name';
        const result = await this.db.query(sql, params);
        return result.rows;
    }
    async getDistricts(municipalityId) {
        let sql = 'SELECT id, code, name, municipality_id as "municipalityId" FROM districts';
        const params = [];
        if (municipalityId) {
            sql += ' WHERE municipality_id = $1';
            params.push(municipalityId);
        }
        sql += ' ORDER BY name';
        const result = await this.db.query(sql, params);
        return result.rows;
    }
    async getNeighborhoods(districtId) {
        let sql = 'SELECT id, code, name, district_id as "districtId" FROM neighborhoods';
        const params = [];
        if (districtId) {
            sql += ' WHERE district_id = $1';
            params.push(districtId);
        }
        sql += ' ORDER BY name LIMIT 200';
        const result = await this.db.query(sql, params);
        return result.rows;
    }
}
exports.TerritoryRepository = TerritoryRepository;
//# sourceMappingURL=territory.repository.js.map