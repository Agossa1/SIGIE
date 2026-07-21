"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureInterventionsRoutes = configureInterventionsRoutes;
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const interventions_repository_1 = require("./repositories/interventions.repository");
const interventions_service_1 = require("./services/interventions.service");
const stats_service_1 = require("./services/stats.service");
const traceability_service_1 = require("./services/traceability.service");
const export_service_1 = require("./services/export.service");
const logs_service_1 = require("./services/logs.service");
const get_all_controller_1 = require("./controllers/get-all.controller");
const get_by_mission_controller_1 = require("./controllers/get-by-mission.controller");
const create_controller_1 = require("./controllers/create.controller");
const update_status_controller_1 = require("./controllers/update-status.controller");
const stats_controller_1 = require("./controllers/stats.controller");
const traceability_controller_1 = require("./controllers/traceability.controller");
const export_controller_1 = require("./controllers/export.controller");
const logs_controller_1 = require("./controllers/logs.controller");
const logger_1 = require("../../shared/loggers/logger");
function configureInterventionsRoutes(db) {
    const router = (0, express_1.Router)();
    const repository = new interventions_repository_1.InterventionsRepository(db, logger_1.logger);
    // Couche service métier (validation + règles)
    const service = new interventions_service_1.InterventionsService(repository);
    // Services spécialisés (stats, export, traçabilité, logs)
    const statsService = new stats_service_1.InterventionsStatsService(repository);
    const traceabilityService = new traceability_service_1.InterventionsTraceabilityService(repository);
    const exportService = new export_service_1.InterventionsExportService(repository);
    const logsService = new logs_service_1.InterventionLogsService(repository);
    // Controllers
    const getAllCtrl = new get_all_controller_1.GetAllInterventionsController(repository);
    const getByMissionCtrl = new get_by_mission_controller_1.GetInterventionsByMissionController(repository);
    const createCtrl = new create_controller_1.CreateInterventionController(service);
    const updateStatusCtrl = new update_status_controller_1.UpdateInterventionStatusController(service);
    const statsCtrl = new stats_controller_1.GetInterventionsStatsController(statsService);
    const traceabilityCtrl = new traceability_controller_1.GetTraceabilityController(traceabilityService);
    const exportCtrl = new export_controller_1.ExportInterventionsCSVController(exportService);
    const logsCtrl = new logs_controller_1.InterventionLogsController(logsService);
    router.use(auth_middleware_1.authMiddleware);
    // Endpoints décisionnels (avant les routes avec :id)
    router.get('/stats', statsCtrl.handle);
    router.get('/traceability/:reportId', traceabilityCtrl.handle);
    router.get('/export/csv', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'prefecture_director', 'mayor']), exportCtrl.handle);
    // CRUD standard
    router.get('/', getAllCtrl.handle);
    router.get('/mission/:missionId', getByMissionCtrl.handle);
    router.post('/', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor']), createCtrl.handle);
    router.patch('/:id/status', updateStatusCtrl.handle);
    // Logs (journal d'intervention)
    router.get('/:id/logs', logsCtrl.getLogs);
    router.post('/:id/logs', logsCtrl.createLog);
    return router;
}
//# sourceMappingURL=interventions.module.js.map