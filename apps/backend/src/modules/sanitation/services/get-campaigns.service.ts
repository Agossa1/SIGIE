import { SanitationRepository } from '../repositories/sanitation.repository';
import type { SanitationCampaign } from '../types/sanitation.types';

export class GetCampaignsService {
    constructor(private readonly repository: SanitationRepository) {}
    async execute(municipalityId?: string, page?: number, limit?: number): Promise<SanitationCampaign[]> {
        return this.repository.getCampaigns(municipalityId, page, limit);
    }
}