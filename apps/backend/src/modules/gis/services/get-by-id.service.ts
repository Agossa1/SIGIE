import { GisRepository } from '../repositories/gis.repository';

export class GetGisLayerByIdService {
    constructor(private readonly repository: GisRepository) {}

    async execute(id: string): Promise<{ id: string; name: string; type: string; features: any[] } | null> {
        const result = await this.repository.getLayerWithFeatures(id);
        if (!result) return null;
        return {
            id: result.layer.id,
            name: result.layer.name,
            type: 'FeatureCollection',
            features: result.features.map((f: any) => f.featureData),
        };
    }
}