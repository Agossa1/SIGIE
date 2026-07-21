import { InfrastructureRepository } from '../repositories/infrastructure.repository';
import type { InfrastructureItem } from '../types/infrastructure.types';

export class GetInfrastructureByIdService {
    constructor(private readonly repository: InfrastructureRepository) {}
    async execute(id: string): Promise<InfrastructureItem | null> {
        return this.repository.getById(id);
    }
}