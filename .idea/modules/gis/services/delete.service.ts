import { GisRepository } from '../repositories/gis.repositories';

export class DeleteGisLayerService {
    constructor(private readonly repository: GisRepository) {}

    async execute(layerId: string): Promise<void> {
        return this.repository.deleteLayer(layerId);
    }
}
