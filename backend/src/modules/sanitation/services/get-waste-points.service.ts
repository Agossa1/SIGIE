import { SanitationRepository } from '../repositories/sanitation.repository';
import type { WastePoint } from '../types/sanitation.types';

export class GetWastePointsService {
    constructor(private readonly repository: SanitationRepository) {}
    async execute(municipalityId?: string, page?: number, limit?: number): Promise<WastePoint[]> {
        return this.repository.getWastePoints(municipalityId, page, limit);
    }
}