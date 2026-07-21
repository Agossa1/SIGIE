"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSanitationRouter = configureSanitationRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureSanitationRouter(getWastePointsCtrl, createWastePointCtrl, getCollectionsCtrl, createCollectionCtrl, getCampaignsCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/points', getWastePointsCtrl.handle);
    router.post('/points', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'sgds_manager']), createWastePointCtrl.handle);
    router.get('/collections', getCollectionsCtrl.handle);
    router.post('/collections', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin', 'sgds_manager']), createCollectionCtrl.handle);
    router.get('/campaigns', getCampaignsCtrl.handle);
    return router;
}
//# sourceMappingURL=sanitation.routes.js.map