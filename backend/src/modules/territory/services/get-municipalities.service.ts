import { TerritoryRepository } from '../repositories/territory.repository';
import type { Municipality } from '../types/territory.types';

export class GetMunicipalitiesService {
    constructor(private readonly repository: TerritoryRepository) {}
    async execute(regionId?: string): Promise<Municipality[]> {
        return this.repository.getMunicipalities(regionId);
    }
}