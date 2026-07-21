import type { Logger } from 'winston';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import type { GeoJsonFeatureCollection } from '../../gis/types/gis.types';

export class NatureRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger
    ) {}

    async getNatureGeoJson(type: 'protected_areas' | 'urban_flora' | 'environmental_sensors' | 'waste_centers', municipalityId?: string): Promise<GeoJsonFeatureCollection> {
        try {
            let sql = '';
            const params: any[] = [];
            
            if (type === 'protected_areas') {
                sql = `
                    SELECT id, name, protection_level, area_type, description, ST_AsGeoJSON(geometry)::json as geometry
                    FROM protected_areas
                `;
            } else if (type === 'urban_flora') {
                sql = `
                    SELECT id, species_name, health_status, height_m, ST_AsGeoJSON(location)::json as geometry
                    FROM urban_flora
                `;
            } else if (type === 'environmental_sensors') {
                sql = `
                    SELECT id, station_name, sensor_type, last_reading, ST_AsGeoJSON(location)::json as geometry
                    FROM environmental_sensors
                `;
            } else if (type === 'waste_centers') {
                sql = `
                    SELECT id, name, center_type, capacity_tons_day, ST_AsGeoJSON(location)::json as geometry
                    FROM waste_valorization_centers
                `;
            }

            if (municipalityId) {
                sql += ` WHERE municipality_id = $1`;
                params.push(municipalityId);
            }

            const result = await this.db.query(sql, params);
            
            return {
                type: 'FeatureCollection',
                features: result.rows.map((row: any) => ({
                    type: 'Feature',
                    geometry: row.geometry,
                    properties: { ...row, geometry: undefined }
                }))
            };
        } catch (error) {
            this.logger.error(`NatureRepository.getNatureGeoJson(${type}) error:`, error);
            throw new BadRequestError(`Erreur lors de la récupération des données de nature: ${type}`);
        }
    }
}
