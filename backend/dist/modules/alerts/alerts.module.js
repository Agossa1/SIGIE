"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAlertsRoutes = configureAlertsRoutes;
const alerts_repository_1 = require("./repositories/alerts.repository");
const get_all_service_1 = require("./services/get-all.service");
const create_service_1 = require("./services/create.service");
const acknowledge_service_1 = require("./services/acknowledge.service");
const get_all_controller_1 = require("./controllers/get-all.controller");
const create_controller_1 = require("./controllers/create.controller");
const acknowledge_controller_1 = require("./controllers/acknowledge.controller");
const alerts_routes_1 = require("./routes/alerts.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Alerts — Injection de dépendances centralisée.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 */
function configureAlertsRoutes(db) {
    const repository = new alerts_repository_1.AlertsRepository(db, logger_1.logger);
    // Services
    const getAllService = new get_all_service_1.GetAllAlertsService(repository);
    const createService = new create_service_1.CreateAlertService(repository);
    const acknowledgeService = new acknowledge_service_1.AcknowledgeAlertService(repository);
    // Controllers
    const getAllCtrl = new get_all_controller_1.GetAllAlertsController(getAllService);
    const createCtrl = new create_controller_1.CreateAlertController(createService);
    const acknowledgeCtrl = new acknowledge_controller_1.AcknowledgeAlertController(acknowledgeService);
    // Routes
    return (0, alerts_routes_1.configureAlertsRouter)(getAllCtrl, createCtrl, acknowledgeCtrl);
}
//# sourceMappingURL=alerts.module.js.map