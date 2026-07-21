import { StubsRepository } from '../repositories/stubs.repository';
import type { ReportCategory } from '../types/stubs.types';

export class GetReportCategoriesService {
    constructor(private readonly repository: StubsRepository) {}
    async execute(): Promise<ReportCategory[]> { return this.repository.getReportCategories(); }
}