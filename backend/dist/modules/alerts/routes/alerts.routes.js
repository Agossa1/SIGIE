"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAlertsRouter = configureAlertsRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureAlertsRouter(getAllCtrl, createCtrl, acknowledgeCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/', getAllCtrl.handle);
    router.post('/', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'ministry', 'prefecture_director']), createCtrl.handle);
    router.patch('/:id/acknowledge', acknowledgeCtrl.handle);
    return router;
}
//# sourceMappingURL=alerts.routes.js.map