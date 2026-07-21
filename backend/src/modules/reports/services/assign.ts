import type { Logger } from 'winston';
import { ReportsRepository } from '../repositories/reports.repository';
import { TechnicianReport, CreateAssignmentDTO } from '../types/reports.types';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class AssignReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(reportId: string, assignedBy: string, dto: CreateAssignmentDTO): Promise<TechnicianReport> {
        const report = await this.repository.getReportById(reportId);
        if (!report) throw new NotFoundError('Signalement non trouvé');
        await this.repository.assignReport(reportId, assignedBy, dto);
        return (await this.repository.getReportById(reportId))!;
    }
}