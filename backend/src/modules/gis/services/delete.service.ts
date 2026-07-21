import { GisRepository } from '../repositories/gis.repository';

export class DeleteGisLayerService {
    constructor(private readonly repository: GisRepository) {}

    async execute(id: string): Promise<void> {
        return this.repository.deleteLayer(id);
    }
}