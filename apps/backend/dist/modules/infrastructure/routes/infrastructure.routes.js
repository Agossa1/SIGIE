"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureInfrastructureRouter = configureInfrastructureRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureInfrastructureRouter(getAllCtrl, getByIdCtrl, createCtrl, updateCtrl, deleteCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/', getAllCtrl.handle);
    router.get('/:id', getByIdCtrl.handle);
    router.post('/', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'dst_manager']), createCtrl.handle);
    router.put('/:id', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'dst_manager']), updateCtrl.handle);
    router.delete('/:id', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']), deleteCtrl.handle);
    return router;
}
//# sourceMappingURL=infrastructure.routes.js.map