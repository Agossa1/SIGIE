import { AlertsRepository } from '../repositories/alerts.repository';
import type { Alert } from '../types/alerts.types';

export class AcknowledgeAlertService {
    constructor(private readonly repository: AlertsRepository) {}

    async execute(id: string, userId: string): Promise<Alert | null> {
        return this.repository.acknowledge(id, userId);
    }
}