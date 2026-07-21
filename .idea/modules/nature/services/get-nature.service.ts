import { NatureRepository } from '../repositories/nature.repository';
import type { GeoJsonFeatureCollection } from '../../gis/types/gis.types';

export class GetNatureService {
    constructor(private readonly repository: NatureRepository) {}

    async execute(
        type: 'protected_areas' | 'urban_flora' | 'environmental_sensors' | 'waste_centers',
        municipalityId?: string
    ): Promise<GeoJsonFeatureCollection> {
        return this.repository.getNatureGeoJson(type, municipalityId);
    }
}
