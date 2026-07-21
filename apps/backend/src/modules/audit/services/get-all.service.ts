import { AuditRepository } from '../repositories/audit.repository';
import type { AuditFilters, PaginatedAuditResponse } from '../types/audit.types';

export class GetAllAuditLogsService {
    constructor(private readonly repository: AuditRepository) {}

    async execute(filters: AuditFilters, page: number, limit: number): Promise<PaginatedAuditResponse> {
        return this.repository.getAll(filters, page, limit);
    }
}