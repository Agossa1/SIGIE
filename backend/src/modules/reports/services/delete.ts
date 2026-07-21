import type { Logger } from 'winston';
import { ReportsRepository } from '../repositories/reports.repository';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(id: string, _userId: string): Promise<void> {
        const deleted = await this.repository.deleteReport(id);
        if (!deleted) throw new NotFoundError('Signalement non trouvé ou déjà supprimé');
        this.logger.info('Report soft-deleted', { reportId: id });
    }
}