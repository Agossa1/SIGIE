import { AlertsRepository } from '../repositories/alerts.repository';
import type { Alert } from '../types/alerts.types';

export class GetAllAlertsService {
    constructor(private readonly repository: AlertsRepository) {}

    async execute(filters: {
        type?: string;
        severity?: string;
        municipalityId?: string;
        page?: number;
        limit?: number;
    }): Promise<Alert[]> {
        return this.repository.getAll(filters);
    }
}