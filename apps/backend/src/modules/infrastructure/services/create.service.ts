import { InfrastructureRepository } from '../repositories/infrastructure.repository';
import type { InfrastructureItem } from '../types/infrastructure.types';

export class CreateInfrastructureService {
    constructor(private readonly repository: InfrastructureRepository) {}
    async execute(data: {
        name: string; infrastructureType: string; description?: string;
        municipalityId?: string; conditionStatus?: string;
        latitude?: number; longitude?: number; userId?: string;
    }): Promise<InfrastructureItem> {
        return this.repository.create(data);
    }
}