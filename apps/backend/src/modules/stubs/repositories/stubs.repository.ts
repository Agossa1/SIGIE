import PostgresDatabase from '../../../infra/database/postgres';
import type { Logger } from 'winston';
import type { ReportCategory } from '../types/stubs.types';
import { DEFAULT_CATEGORIES } from '../types/stubs.types';

export class StubsRepository {
    constructor(
        private readonly db: PostgresDatabase,
        private readonly logger: Logger,
    ) {}

    async getReportCategories(): Promise<ReportCategory[]> {
        try {
            const { rows } = await this.db.query(
                'SELECT code, label, icon, color, description FROM report_categories WHERE is_active = TRUE ORDER BY sort_order'
            );
            if (rows.length > 0) return rows;
            return DEFAULT_CATEGORIES;
        } catch {
            return DEFAULT_CATEGORIES;
        }
    }
}