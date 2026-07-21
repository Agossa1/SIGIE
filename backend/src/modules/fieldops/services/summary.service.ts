import { FieldOpsRepository } from '../repositories/fieldops.repository';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';
import type { TokenPayload } from '../../auth/types/auth.types';
import type { FieldOpsSummary } from '../types/fieldops.types';

export class GetFieldOpsSummaryService {
    constructor(private readonly repository: FieldOpsRepository) {}

    async execute(user?: TokenPayload): Promise<FieldOpsSummary> {
        const filters = user ? applyTerritorialFilter(user) : {};

        const stats = await this.repository.getSummary(filters);

        return {
            missions: {
                active: parseInt(stats?.active_missions || '0'),
                planned: parseInt(stats?.planned_missions || '0'),
                completedToday: parseInt(stats?.completed_today || '0'),
                total: parseInt(stats?.total_missions || '0'),
            },
            reports: {
                pending: parseInt(stats?.pending_reports || '0'),
                resolved: parseInt(stats?.resolved_reports || '0'),
                critical: parseInt(stats?.critical_reports || '0'),
                total: parseInt(stats?.total_reports || '0'),
            },
            interventions: {
                active: parseInt(stats?.active_interventions || '0'),
                total: parseInt(stats?.total_interventions || '0'),
            },
            teams: {
                active: parseInt(stats?.active_teams || '0'),
                total: parseInt(stats?.total_teams || '0'),
            },
        };
    }
}