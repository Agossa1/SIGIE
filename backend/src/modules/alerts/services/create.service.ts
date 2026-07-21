import { AlertsRepository } from '../repositories/alerts.repository';
import type { Alert } from '../types/alerts.types';

export class CreateAlertService {
    constructor(private readonly repository: AlertsRepository) {}

    async execute(data: {
        title: string;
        description?: string;
        alertType: string;
        severity?: string;
        municipalityId?: string;
        regionId?: string;
        validUntil?: string;
        userId: string;
    }): Promise<Alert> {
        return this.repository.create({
            ...data,
            severity: data.severity || 'info',
        });
    }
}