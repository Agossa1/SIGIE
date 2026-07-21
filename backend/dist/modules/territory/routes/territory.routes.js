"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTerritoryRouter = configureTerritoryRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureTerritoryRouter(getRegionsCtrl, getMunicipalitiesCtrl, getDistrictsCtrl, getNeighborhoodsCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/regions', getRegionsCtrl.handle);
    router.get('/municipalities', getMunicipalitiesCtrl.handle);
    router.get('/districts', getDistrictsCtrl.handle);
    router.get('/neighborhoods', getNeighborhoodsCtrl.handle);
    return router;
}
//# sourceMappingURL=territory.routes.js.map