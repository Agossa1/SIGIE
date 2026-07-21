"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interventionsRouter = void 0;
const express_1 = require("express");
const interventions_controller_1 = require("../controllers/interventions.controller");
const interventions_repository_1 = require("../repositories/interventions.repository");
const create_service_1 = require("../services/create.service");
const get_by_mission_service_1 = require("../services/get-by-mission.service");
const get_by_team_service_1 = require("../services/get-by-team.service");
const update_status_service_1 = require("../services/update-status.service");
const report_service_1 = require("../services/report.service");
const winston_1 = require("winston");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const interventionsRouter = (db) => {
    const router = (0, express_1.Router)();
    const logger = (0, winston_1.createLogger)({
        format: winston_1.format.simple(),
        transports: [new winston_1.transports.Console()],
    });
    const repository = new interventions_repository_1.InterventionsRepository(db, logger);
    const createService = new create_service_1.CreateInterventionService(repository);
    const getByMissionService = new get_by_mission_service_1.GetInterventionsByMissionService(repository);
    const getByTeamService = new get_by_team_service_1.GetInterventionsByTeamService(repository);
    const updateStatusService = new update_status_service_1.UpdateInterventionStatusService(repository);
    const reportService = new report_service_1.AddInterventionReportService(repository);
    // Create intervention
    router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor']), (0, interventions_controller_1.createInterventionController)(createService));
    // Get interventions by team (must be placed before /mission/:missionId if we used /:id but here we use /my-team)
    router.get('/my-team', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor', 'field_agent']), (0, interventions_controller_1.getInterventionsByTeamController)(getByTeamService));
    // Get interventions by mission
    router.get('/mission/:missionId', auth_middleware_1.authMiddleware, (0, interventions_controller_1.getInterventionsByMissionController)(getByMissionService));
    // Update intervention status
    router.patch('/:id/status', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor', 'field_agent']), (0, interventions_controller_1.updateInterventionStatusController)(updateStatusService));
    // Add intervention report
    router.post('/:id/reports', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor', 'field_agent']), (0, interventions_controller_1.addInterventionReportController)(reportService));
    return router;
};
exports.interventionsRouter = interventionsRouter;
//# sourceMappingURL=interventions.routes.js.map