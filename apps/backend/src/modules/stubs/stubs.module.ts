import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { StubsRepository } from './repositories/stubs.repository';
import { GetReportCategoriesService } from './services/report-categories.service';
import { GetReportCategoriesController } from './controllers/report-categories.controller';
import { configureStubsRouter } from './routes/stubs.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Stubs — Fallback pour les routes non migrées.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureStubRoutes(db: PostgresDatabase): Router {
    const repository = new StubsRepository(db, logger);

    // Service
    const reportCategoriesService = new GetReportCategoriesService(repository);

    // Controller
    const reportCategoriesCtrl = new GetReportCategoriesController(reportCategoriesService);

    // Routes
    return configureStubsRouter(reportCategoriesCtrl);
}