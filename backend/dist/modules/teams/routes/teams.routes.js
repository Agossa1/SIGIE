"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTeamsRouter = configureTeamsRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureTeamsRouter(getAllCtrl, getMembersCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/', getAllCtrl.handle);
    router.get('/:id/members', getMembersCtrl.handle);
    return router;
}
//# sourceMappingURL=teams.routes.js.map