"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const logger_1 = require("../../../shared/loggers/logger");
const users_module_1 = require("../users.module");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const usersRouter = (db) => {
    const router = (0, express_1.Router)();
    const usersModule = new users_module_1.UsersModule(db, logger_1.logger);
    router.get('/me', auth_middleware_1.authMiddleware, usersModule.usersController.getMe);
    router.patch('/me', auth_middleware_1.authMiddleware, usersModule.usersController.updateMe);
    router.get('/', auth_middleware_1.authMiddleware, usersModule.usersController.getAllUsers);
    router.patch('/:id/roles', auth_middleware_1.authMiddleware, usersModule.usersController.assignRole);
    return router;
};
exports.usersRouter = usersRouter;
//# sourceMappingURL=users.routes.js.map