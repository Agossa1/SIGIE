"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureStubsRouter = configureStubsRouter;
const express_1 = require("express");
function configureStubsRouter(reportCategoriesCtrl) {
    const router = (0, express_1.Router)();
    const emptyList = (_req, res) => res.json({ success: true, data: [] });
    const emptyObj = (_req, res) => res.json({ success: true, data: {} });
    // Analytics (pas encore de module dédié)
    router.get('/analytics', emptyObj);
    // Media (pas encore de module dédié)
    router.get('/media', emptyList);
    // Report categories
    router.get('/report-categories', reportCategoriesCtrl.handle);
    // Catch-all pour éviter les 404 sur les routes non migrées
    router.use((_req, res) => {
        res.json({ success: true, data: [] });
    });
    return router;
}
//# sourceMappingURL=stubs.routes.js.map