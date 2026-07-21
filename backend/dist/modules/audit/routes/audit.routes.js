"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuditRouter = configureAuditRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureAuditRouter(getAllCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.use((0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']));
    router.get('/', getAllCtrl.handle);
    return router;
}
//# sourceMappingURL=audit.routes.js.map