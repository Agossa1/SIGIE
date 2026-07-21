import { Router } from 'express';
import { 
    createInterventionController, 
    getInterventionsByMissionController, 
    getInterventionsByTeamController,
    updateInterventionStatusController,
    addInterventionReportController
} from '../controllers/interventions.controller';
import { InterventionsRepository } from '../repositories/interventions.repository';
import { CreateInterventionService } from '../services/create.service';
import { GetInterventionsByMissionService } from '../services/get-by-mission.service';
import { GetInterventionsByTeamService } from '../services/get-by-team.service';
import { UpdateInterventionStatusService } from '../services/update-status.service';
import { AddInterventionReportService } from '../services/report.service';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const interventionsRouter = (db: PostgresDatabase) => {
    const router = Router();

    const logger = createLogger({
        format: format.simple(),
        transports: [new transports.Console()],
    });

    const repository = new InterventionsRepository(db, logger);
    const createService = new CreateInterventionService(repository);
    const getByMissionService = new GetInterventionsByMissionService(repository);
    const getByTeamService = new GetInterventionsByTeamService(repository);
    const updateStatusService = new UpdateInterventionStatusService(repository);
    const reportService = new AddInterventionReportService(repository);

    // Create intervention
    router.post(
        '/',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor']),
        createInterventionController(createService)
    );

    // Get interventions by team (must be placed before /mission/:missionId if we used /:id but here we use /my-team)
    router.get(
        '/my-team',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor', 'field_agent']),
        getInterventionsByTeamController(getByTeamService)
    );

    // Get interventions by mission
    router.get(
        '/mission/:missionId',
        authMiddleware,
        getInterventionsByMissionController(getByMissionService)
    );

    // Update intervention status
    router.patch(
        '/:id/status',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor', 'field_agent']),
        updateInterventionStatusController(updateStatusService)
    );

    // Add intervention report
    router.post(
        '/:id/reports',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin', 'supervisor', 'field_agent']),
        addInterventionReportController(reportService)
    );

    return router;
};
