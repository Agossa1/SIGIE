import { TerritoryRepository } from '../repositories/territory.repository';
import type { District } from '../types/territory.types';

export class GetDistrictsService {
    constructor(private readonly repository: TerritoryRepository) {}
    async execute(municipalityId?: string): Promise<District[]> {
        return this.repository.getDistricts(municipalityId);
    }
}