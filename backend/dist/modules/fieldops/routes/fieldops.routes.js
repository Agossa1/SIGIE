"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureFieldOpsRouter = configureFieldOpsRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureFieldOpsRouter(summaryCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/summary', summaryCtrl.handle);
    return router;
}
//# sourceMappingURL=fieldops.routes.js.map