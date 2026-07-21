"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureStubRoutes = configureStubRoutes;
const stubs_repository_1 = require("./repositories/stubs.repository");
const report_categories_service_1 = require("./services/report-categories.service");
const report_categories_controller_1 = require("./controllers/report-categories.controller");
const stubs_routes_1 = require("./routes/stubs.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Stubs — Fallback pour les routes non migrées.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureStubRoutes(db) {
    const repository = new stubs_repository_1.StubsRepository(db, logger_1.logger);
    // Service
    const reportCategoriesService = new report_categories_service_1.GetReportCategoriesService(repository);
    // Controller
    const reportCategoriesCtrl = new report_categories_controller_1.GetReportCategoriesController(reportCategoriesService);
    // Routes
    return (0, stubs_routes_1.configureStubsRouter)(reportCategoriesCtrl);
}
//# sourceMappingURL=stubs.module.js.map