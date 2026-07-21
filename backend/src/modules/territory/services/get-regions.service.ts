import { TerritoryRepository } from '../repositories/territory.repository';
import type { Region } from '../types/territory.types';

export class GetRegionsService {
    constructor(private readonly repository: TerritoryRepository) {}
    async execute(): Promise<Region[]> { return this.repository.getRegions(); }
}