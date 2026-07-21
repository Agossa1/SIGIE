"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureGisRouter = configureGisRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureGisRouter(getAllCtrl, getByIdCtrl, createCtrl, deleteCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/', getAllCtrl.handle);
    router.get('/:id/geojson', getByIdCtrl.handle);
    router.post('/', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']), createCtrl.handle);
    router.delete('/:id', (0, auth_middleware_1.requireRole)(['super_admin', 'platform_admin']), deleteCtrl.handle);
    return router;
}
//# sourceMappingURL=gis.routes.js.map