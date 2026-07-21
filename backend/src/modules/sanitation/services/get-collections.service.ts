import { SanitationRepository } from '../repositories/sanitation.repository';
import type { WasteCollection } from '../types/sanitation.types';

export class GetCollectionsService {
    constructor(private readonly repository: SanitationRepository) {}
    async execute(municipalityId?: string, status?: string, page?: number, limit?: number): Promise<WasteCollection[]> {
        return this.repository.getCollections(municipalityId, status, page, limit);
    }
}