import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { AlertsRepository } from './repositories/alerts.repository';
import { GetAllAlertsService } from './services/get-all.service';
import { CreateAlertService } from './services/create.service';
import { AcknowledgeAlertService } from './services/acknowledge.service';
import { GetAllAlertsController } from './controllers/get-all.controller';
import { CreateAlertController } from './controllers/create.controller';
import { AcknowledgeAlertController } from './controllers/acknowledge.controller';
import { configureAlertsRouter } from './routes/alerts.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Alerts — Injection de dépendances centralisée.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
export function configureAlertsRoutes(db: PostgresDatabase): Router {
    const repository = new AlertsRepository(db, logger);

    // Services
    const getAllService = new GetAllAlertsService(repository);
    const createService = new CreateAlertService(repository);
    const acknowledgeService = new AcknowledgeAlertService(repository);

    // Controllers
    const getAllCtrl = new GetAllAlertsController(getAllService);
    const createCtrl = new CreateAlertController(createService);
    const acknowledgeCtrl = new AcknowledgeAlertController(acknowledgeService);

    // Routes
    return configureAlertsRouter(getAllCtrl, createCtrl, acknowledgeCtrl);
}