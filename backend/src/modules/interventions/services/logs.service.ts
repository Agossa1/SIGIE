import { InterventionsRepository } from '../repositories/interventions.repository';
import type { InterventionLog, CreateInterventionLogDTO } from '../types/logs.types';

export class InterventionLogsService {
    constructor(private readonly repository: InterventionsRepository) {}

    async getLogs(interventionId: string): Promise<InterventionLog[]> {
        return this.repository.getLogsByInterventionId(interventionId);
    }

    async log(dto: CreateInterventionLogDTO): Promise<InterventionLog> {
        return this.repository.addLog(dto);
    }
}