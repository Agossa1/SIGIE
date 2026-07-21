"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuditRoutes = configureAuditRoutes;
const audit_repository_1 = require("./repositories/audit.repository");
const get_all_service_1 = require("./services/get-all.service");
const get_all_controller_1 = require("./controllers/get-all.controller");
const audit_routes_1 = require("./routes/audit.routes");
const logger_1 = require("../../shared/loggers/logger");
/**
 * Module Audit — Consultation des journaux de traçabilité.
 * Pattern : Repository → Service → Controller → Router (identique à auth).
 * Lecture seule, réservé aux super_admin et platform_admin.
 */
function configureAuditRoutes(db) {
    const repository = new audit_repository_1.AuditRepository(db, logger_1.logger);
    // Service
    const getAllService = new get_all_service_1.GetAllAuditLogsService(repository);
    // Controller
    const getAllCtrl = new get_all_controller_1.GetAllAuditLogsController(getAllService);
    // Routes
    return (0, audit_routes_1.configureAuditRouter)(getAllCtrl);
}
//# sourceMappingURL=audit.module.js.map