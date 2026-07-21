import type { Logger } from 'winston';
import { ReportsRepository } from '../repositories/reports.repository';
import { ReportComment, CreateCommentDTO } from '../types/reports.types';
import { NotFoundError } from '../../../../src/shared/errors/appErrors';

export class CommentReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(reportId: string, authorId: string, dto: CreateCommentDTO): Promise<ReportComment> {
        const report = await this.repository.getReportById(reportId);
        if (!report) throw new NotFoundError('Signalement non trouvé');
        return this.repository.addComment(reportId, authorId, dto);
    }
}