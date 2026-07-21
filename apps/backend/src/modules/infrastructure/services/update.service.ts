import { InfrastructureRepository } from '../repositories/infrastructure.repository';
import type { InfrastructureItem } from '../types/infrastructure.types';

export class UpdateInfrastructureService {
    constructor(private readonly repository: InfrastructureRepository) {}
    async execute(id: string, data: {
        name?: string; description?: string; conditionStatus?: string;
        latitude?: number; longitude?: number;
    }): Promise<InfrastructureItem | null> {
        return this.repository.update(id, data);
    }
}