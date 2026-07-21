import { InterventionsRepository } from '../repositories/interventions.repository';
import { CreateInterventionReportDTO } from '../types/interventions.types';

export class AddInterventionReportService {
    constructor(private readonly repository: InterventionsRepository) {}

    async execute(interventionId: string, createdBy: string, dto: CreateInterventionReportDTO): Promise<string> {
        return this.repository.addInterventionReport(interventionId, createdBy, dto);
    }
}
