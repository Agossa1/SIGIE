 import type { Logger } from 'winston';
import { ReportsRepository } from '../repositories/reports.repository';
import { TechnicianReport } from '../types/reports.types';
import type { UpdateReportDTO } from '../validations/update.validations';
import { BadRequestError, NotFoundError } from '../../../../src/shared/errors/appErrors';

export class UpdateReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(id: string, dto: UpdateReportDTO, _userId: string): Promise<TechnicianReport> {
        const existing = await this.repository.getReportById(id);
        if (!existing) throw new NotFoundError('Signalement non trouvé');
        const updated = await this.repository.updateReport(id, dto);
        if (!updated) throw new BadRequestError('Échec de la mise à jour du signalement');
        this.logger.info('Report updated', { reportId: id });
        return updated;
    }
}