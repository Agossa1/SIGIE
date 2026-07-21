"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureReportsRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../../../../src/shared/loggers/logger");
const auth_middleware_1 = require("../../../../src/shared/middlewares/auth.middleware");
const reports_module_1 = require("../reports.module");
const configureReportsRoutes = (db) => {
    const router = (0, express_1.Router)();
    const module = new reports_module_1.ReportsModule(db, logger_1.logger);
    // Appliquer l'auth middleware à toutes les routes
    router.use(auth_middleware_1.authMiddleware);
    // Routes de lecture — tout utilisateur authentifié
    router.get('/', module.controllers.get.getAll);
    router.get('/:id', module.controllers.get.getById);
    // Routes d'écriture — rôles autorisés
    const writeRoles = ['super_admin', 'platform_admin', 'supervisor', 'team_leader'];
    router.post('/', (0, auth_middleware_1.requireRole)(writeRoles), module.controllers.create.create);
    router.put('/:id', (0, auth_middleware_1.requireRole)(writeRoles), module.controllers.update.update);
    router.delete('/:id', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']), module.controllers.delete.delete);
    router.post('/:id/comments', (0, auth_middleware_1.requireRole)(writeRoles), module.controllers.comment.addComment);
    router.post('/:id/assign', (0, auth_middleware_1.requireRole)(writeRoles), module.controllers.assign.assign);
    return router;
};
exports.configureReportsRoutes = configureReportsRoutes;
//# sourceMappingURL=reports.routes.js.map