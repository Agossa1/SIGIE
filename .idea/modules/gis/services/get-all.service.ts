import { GisRepository } from '../repositories/gis.repositories';
import type { GisLayer } from '../types/gis.types';

export class GetAllGisLayersService {
    constructor(private readonly repository: GisRepository) {}

    async execute(): Promise<GisLayer[]> {
        return this.repository.getLayers();
    }
}
