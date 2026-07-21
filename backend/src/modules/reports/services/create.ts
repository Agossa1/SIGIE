import type { Logger } from 'winston';
import { ReportsRepository } from '../repositories/reports.repository';
import { TechnicianReport, CreateReportDTO } from '../types/reports.types';

export class CreateReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(dto: CreateReportDTO, userId: string): Promise<TechnicianReport> {
        this.logger.info('Creating report', { userId, category: dto.issueCategory });
        return this.repository.createReport(dto, userId);
    }
}