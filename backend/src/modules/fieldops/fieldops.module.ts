import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { FieldOpsRepository } from './repositories/fieldops.repository';
import { GetFieldOpsSummaryService } from './services/summary.service';
import { GetFieldOpsSummaryController } from './controllers/get-summary.controller';
import { configureFieldOpsRouter } from './routes/fieldops.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module FieldOps — Vue agrégée des opérations terrain.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureFieldOpsRoutes(db: PostgresDatabase): Router {
    const repository = new FieldOpsRepository(db, logger);

    // Service
    const summaryService = new GetFieldOpsSummaryService(repository);

    // Controller
    const summaryCtrl = new GetFieldOpsSummaryController(summaryService);

    // Routes
    return configureFieldOpsRouter(summaryCtrl);
}