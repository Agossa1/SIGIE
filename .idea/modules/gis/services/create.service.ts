import { GisRepository } from '../repositories/gis.repositories';
import type { GeoJsonFeatureCollection } from '../types/gis.types';
import { TerritoryRepository } from '../../territory/repositories/territory.repositories';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import redisClient from '../../../../apps/backend/src/config/redis/redisConfig';

export class UploadGisLayerService {
    constructor(
        private readonly repository: GisRepository,
        private readonly territoryRepository?: TerritoryRepository
    ) {}

    async execute(params: {
        name: string;
        layerType: string;
        description?: string;
        municipalityId?: string;
        createdBy?: string;
        geojson: GeoJsonFeatureCollection;
    }): Promise<{ layerId: string; featureCount: number }> {
        if (!params.geojson || params.geojson.type !== 'FeatureCollection' || !Array.isArray(params.geojson.features)) {
            throw new BadRequestError('Le fichier doit être un GeoJSON FeatureCollection valide');
        }

        const features = params.geojson.features ?? [];

        // 1. Sauvegarder la couche dans GIS
        const layerId = await this.repository.createLayer({
            name: params.name,
            layerType: params.layerType,
            description: params.description,
            municipalityId: params.municipalityId,
            createdBy: params.createdBy,
        });
        await this.repository.insertFeatures(layerId, features);

        // 2. Si le type est territorial, mettre à jour les tables de découpage (si injecté)
        if (this.territoryRepository && params.layerType.match(/^(region|municipality|district|neighborhood)$/)) {
            let isTerritoryUpdate = false;
            
            switch (params.layerType) {
                case 'region':
                    await this.territoryRepository.upsertRegions(features);
                    isTerritoryUpdate = true;
                    break;
                case 'municipality':
                    await this.territoryRepository.upsertMunicipalities(features);
                    isTerritoryUpdate = true;
                    break;
                case 'district':
                    await this.territoryRepository.upsertDistricts(features);
                    isTerritoryUpdate = true;
                    break;
                case 'neighborhood':
                    await this.territoryRepository.upsertNeighborhoods(features);
                    isTerritoryUpdate = true;
                    break;
            }

            if (isTerritoryUpdate) {
                try {
                    if (redisClient && redisClient.isOpen) {
                        const keys = await redisClient.keys('territory_geojson:*');
                        if (keys.length > 0) {
                            await redisClient.del(keys);
                        }
                    }
                } catch (err) {
                    console.warn('Failed to clear territory cache:', err);
                }
            }
        }

        return { layerId, featureCount: features.length };
    }
}
