import { TerritoryRepository } from '../repositories/territory.repository';
import type { Neighborhood } from '../types/territory.types';

export class GetNeighborhoodsService {
    constructor(private readonly repository: TerritoryRepository) {}
    async execute(districtId?: string): Promise<Neighborhood[]> {
        return this.repository.getNeighborhoods(districtId);
    }
}