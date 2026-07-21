"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesRouter = void 0;
const express_1 = require("express");
const logger_1 = require("../../../shared/loggers/logger");
const roles_module_1 = require("../roles.module");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const rolesRouter = (db) => {
    const router = (0, express_1.Router)();
    const rolesModule = new roles_module_1.RolesModule(db, logger_1.logger);
    router.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), rolesModule.rolesController.getAllRoles);
    router.put('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), rolesModule.rolesController.updateRole);
    return router;
};
exports.rolesRouter = rolesRouter;
//# sourceMappingURL=roles.routes.js.map