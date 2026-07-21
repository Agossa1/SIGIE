import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { AuditRepository } from './repositories/audit.repository';
import { GetAllAuditLogsService } from './services/get-all.service';
import { GetAllAuditLogsController } from './controllers/get-all.controller';
import { configureAuditRouter } from './routes/audit.routes';
import { logger } from '../../shared/loggers/logger';

/**
 * Module Audit — Consultation des journaux de traçabilité.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 * Lecture seule, réservé aux super_admin et platform_admin.
 */
export function configureAuditRoutes(db: PostgresDatabase): Router {
    const repository = new AuditRepository(db, logger);

    // Service
    const getAllService = new GetAllAuditLogsService(repository);

    // Controller
    const getAllCtrl = new GetAllAuditLogsController(getAllService);

    // Routes
    return configureAuditRouter(getAllCtrl);
}