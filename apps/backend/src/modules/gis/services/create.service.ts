import { GisRepository } from '../repositories/gis.repository';

export class CreateGisLayerService {
    constructor(private readonly repository: GisRepository) {}

    async execute(data: {
        name: string;
        layerType: string;
        description?: string;
        municipalityId?: string;
        userId?: string;
        geojson: { features: any[] };
    }): Promise<{ layerId: string; featureCount: number }> {
        return this.repository.createLayer(data);
    }
}