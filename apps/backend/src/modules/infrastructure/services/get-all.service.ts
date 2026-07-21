import { InfrastructureRepository } from '../repositories/infrastructure.repository';
import type { InfrastructureFilters, PaginatedInfrastructureResponse } from '../types/infrastructure.types';

export class GetAllInfrastructureService {
    constructor(private readonly repository: InfrastructureRepository) {}
    async execute(filters: InfrastructureFilters, page: number, limit: number): Promise<PaginatedInfrastructureResponse> {
        return this.repository.getAll(filters, page, limit);
    }
}