"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldOpsRouter = void 0;
const express_1 = require("express");
const create_controller_1 = require("../controllers/create.controller");
const get_controller_1 = require("../controllers/get.controller");
const update_controller_1 = require("../controllers/update.controller");
const delete_controller_1 = require("../controllers/delete.controller");
const field_ops_repositories_1 = require("../repositories/field-ops.repositories");
const create_service_1 = require("../services/create.service");
const get_service_1 = require("../services/get.service");
const update_service_1 = require("../services/update.service");
const delete_service_1 = require("../services/delete.service");
const sync_service_1 = require("../services/sync.service");
const sync_controller_1 = require("../controllers/sync.controller");
const winston_1 = require("winston");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const fieldOpsRouter = (db) => {
    const router = (0, express_1.Router)();
    // Logger local du module
    const logger = (0, winston_1.createLogger)({
        format: winston_1.format.simple(),
        transports: [new winston_1.transports.Console()],
    });
    // 💉 Injection de dépendances
    const repository = new field_ops_repositories_1.FieldOpsRepository(db, logger);
    const createService = new create_service_1.CreateReportService(repository);
    const getService = new get_service_1.GetReportService(repository);
    const updateService = new update_service_1.UpdateReportService(repository);
    const deleteService = new delete_service_1.DeleteReportService(repository);
    const syncService = new sync_service_1.SyncReportsService(repository);
    // ── Lecture ──────────────────────────────────────────────────────────────
    // Tout utilisateur authentifié peut lire la liste
    router.get('/', auth_middleware_1.authMiddleware, (0, get_controller_1.getReportsController)(getService));
    // Tout utilisateur authentifié peut lire un rapport par ID
    router.get('/:id', auth_middleware_1.authMiddleware, (0, get_controller_1.getReportByIdController)(getService));
    // ── Écriture ─────────────────────────────────────────────────────────────
    // Seuls les techniciens / agents terrain / super admins peuvent créer
    router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['technician', 'field_agent', 'super_admin']), (0, create_controller_1.createReportController)(createService));
    // Sync par lots pour les clients hors connexion
    router.post('/sync', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['technician', 'field_agent', 'super_admin']), (0, sync_controller_1.syncReportsController)(syncService));
    // ── Modification / Suppression ────────────────────────────────────────────
    router.patch('/:id/status', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['technician', 'field_agent', 'super_admin']), (0, update_controller_1.updateReportController)(updateService));
    router.delete('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']), (0, delete_controller_1.deleteReportController)(deleteService));
    return router;
};
exports.fieldOpsRouter = fieldOpsRouter;
//# sourceMappingURL=field-ops.routes.js.map