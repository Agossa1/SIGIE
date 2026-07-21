"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureFieldOpsRoutes = configureFieldOpsRoutes;
const fieldops_repository_1 = require("./repositories/fieldops.repository");
const summary_service_1 = require("./services/summary.service");
const get_summary_controller_1 = require("./controllers/get-summary.controller");
const fieldops_routes_1 = require("./routes/fieldops.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module FieldOps — Vue agrégée des opérations terrain.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureFieldOpsRoutes(db) {
    const repository = new fieldops_repository_1.FieldOpsRepository(db, logger_1.logger);
    // Service
    const summaryService = new summary_service_1.GetFieldOpsSummaryService(repository);
    // Controller
    const summaryCtrl = new get_summary_controller_1.GetFieldOpsSummaryController(summaryService);
    // Routes
    return (0, fieldops_routes_1.configureFieldOpsRouter)(summaryCtrl);
}
//# sourceMappingURL=fieldops.module.js.map