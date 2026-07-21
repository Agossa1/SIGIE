import { SanitationRepository } from '../repositories/sanitation.repository';
import type { WasteCollection } from '../types/sanitation.types';

export class CreateCollectionService {
    constructor(private readonly repository: SanitationRepository) {}
    async execute(data: {
        municipalityId?: string; collectionDate: string; volumeCollected?: number; teamId?: string;
    }): Promise<WasteCollection> {
        return this.repository.createCollection(data);
    }
}