import { InterventionsRepository } from '../repositories/interventions.repository';
import type { InterventionStats } from '../types/interventions.types';

export class InterventionsStatsService {
    constructor(private readonly repository: InterventionsRepository) {}

    async getStats(filters?: {
        municipalityId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<InterventionStats> {
        const result = await this.repository.getStats(filters || {});

        return {
            total: parseInt(String(result.stats?.total || 0)),
            inProgress: parseInt(String(result.stats?.inProgress || 0)),
            completedToday: parseInt(String(result.stats?.completedToday || 0)),
            averageResolutionHours: parseFloat(String(result.stats?.averageResolutionHours || 0)),
            byType: result.byType,
            byMunicipality: result.byMunicipality,
        };
    }
}