import { Router } from 'express';
import PostgresDatabase from '../../infra/database/postgres';
import { authMiddleware, requireRole } from '../../shared/middlewares/auth.middleware';
import { InterventionsRepository } from './repositories/interventions.repository';
import { InterventionsService } from './services/interventions.service';
import { InterventionsStatsService } from './services/stats.service';
import { InterventionsTraceabilityService } from './services/traceability.service';
import { InterventionsExportService } from './services/export.service';
import { InterventionLogsService } from './services/logs.service';
import { GetAllInterventionsController } from './controllers/get-all.controller';
import { GetInterventionsByMissionController } from './controllers/get-by-mission.controller';
import { CreateInterventionController } from './controllers/create.controller';
import { UpdateInterventionStatusController } from './controllers/update-status.controller';
import { GetInterventionsStatsController } from './controllers/stats.controller';
import { GetTraceabilityController } from './controllers/traceability.controller';
import { ExportInterventionsCSVController } from './controllers/export.controller';
import { InterventionLogsController } from './controllers/logs.controller';
import { logger } from '../../shared/loggers/logger';

export function configureInterventionsRoutes(db: PostgresDatabase): Router {
    const router = Router();
    const repository = new InterventionsRepository(db, logger);

    // Couche service métier (validation + règles)
    const service = new InterventionsService(repository);

    // Services spécialisés (stats, export, traçabilité, logs)
    const statsService = new InterventionsStatsService(repository);
    const traceabilityService = new InterventionsTraceabilityService(repository);
    const exportService = new InterventionsExportService(repository);
    const logsService = new InterventionLogsService(repository);

    // Controllers
    const getAllCtrl = new GetAllInterventionsController(repository);
    const getByMissionCtrl = new GetInterventionsByMissionController(repository);
    const createCtrl = new CreateInterventionController(service);
    const updateStatusCtrl = new UpdateInterventionStatusController(service);
    const statsCtrl = new GetInterventionsStatsController(statsService);
    const traceabilityCtrl = new GetTraceabilityController(traceabilityService);
    const exportCtrl = new ExportInterventionsCSVController(exportService);
    const logsCtrl = new InterventionLogsController(logsService);

    router.use(authMiddleware);

    // Endpoints décisionnels (avant les routes avec :id)
    router.get('/stats', statsCtrl.handle);
    router.get('/traceability/:reportId', traceabilityCtrl.handle);
    router.get('/export/csv', requireRole(['super_admin', 'platform_admin', 'prefecture_director', 'mayor']), exportCtrl.handle);

    // CRUD standard
    router.get('/', getAllCtrl.handle);
    router.get('/mission/:missionId', getByMissionCtrl.handle);
    router.post('/', requireRole(['super_admin', 'platform_admin', 'supervisor']), createCtrl.handle);
    router.patch('/:id/status', updateStatusCtrl.handle);

    // Logs (journal d'intervention)
    router.get('/:id/logs', logsCtrl.getLogs);
    router.post('/:id/logs', logsCtrl.createLog);

    return router;
}