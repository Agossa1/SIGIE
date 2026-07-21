"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const missions_module_1 = require("../missions.module");
const missionsRouter = (db) => {
    const router = (0, express_1.Router)();
    const module = new missions_module_1.MissionsModule(db);
    router.use(auth_middleware_1.authMiddleware);
    // CRUD Missions
    router.get('/', (req, res, next) => module.services.get.controller.handle(req, res, next));
    router.post('/', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor']), (req, res, next) => module.services.create.controller.handle(req, res, next));
    router.get('/:id', (req, res, next) => module.services.getById.controller.handle(req, res, next));
    router.put('/:id', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'supervisor']), (req, res, next) => module.services.update.controller.handle(req, res, next));
    router.patch('/:id/status', (req, res, next) => module.services.updateStatus.controller.handle(req, res, next));
    // Assignation + Rapports
    router.post('/:id/assignments', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']), (req, res, next) => module.services.assign.controller.handle(req, res, next));
    router.post('/:id/reports', (req, res, next) => module.services.report.controller.handle(req, res, next));
    return router;
};
exports.missionsRouter = missionsRouter;
//# sourceMappingURL=missions.routes.js.map