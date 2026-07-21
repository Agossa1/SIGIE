import { GisRepository } from '../repositories/gis.repositories';
import type { GeoJsonFeatureCollection } from '../types/gis.types';

export class GetGeoJsonLayerService {
    constructor(private readonly repository: GisRepository) {}

    async execute(
        layerId: string,
        options?: {
            limit?: number;
            offset?: number;
            bbox?: [number, number, number, number];
        }
    ): Promise<GeoJsonFeatureCollection | null> {
        return this.repository.getLayerAsGeoJson(layerId, options);
    }
}
