import type { Logger } from 'winston';
import { ReportsRepository } from '../repositories/reports.repository';
import { TechnicianReport, PaginatedResponse, ReportFilters } from '../types/reports.types';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { TokenPayload } from '../../auth/types/auth.types';
import { applyTerritorialFilter } from '../../../shared/middlewares/territorialFilter.middleware';
import { redisCache } from '../../../config/redis/redis.service';

export class GetReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async getAll(filters: ReportFilters, user?: TokenPayload): Promise<PaginatedResponse<TechnicianReport>> {
        // 🔐 Filtrage territorial centralisé
        if (user) {
            const territorialFilters = applyTerritorialFilter(user);
            Object.assign(filters, territorialFilters);
        }

        // Cache Redis bypass temporaire pour forcer le refresh
        // const cacheKey = `reports:list:${JSON.stringify({ ...filters, page: undefined, limit: undefined })}`;
        // return redisCache.getOrSet(cacheKey, () => this.repository.getReports(filters), 120);
        return this.repository.getReports(filters);
    }

    async byId(id: string): Promise<TechnicianReport> {
        const report = await this.repository.getReportById(id);
        if (!report) throw new NotFoundError('Signalement non trouvé');
        report.comments = await this.repository.getComments(id);
        return report;
    }
}