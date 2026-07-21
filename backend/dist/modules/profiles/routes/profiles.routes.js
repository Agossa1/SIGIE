"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureProfilesRouter = configureProfilesRouter;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
function configureProfilesRouter(getProfileCtrl, updateProfileCtrl) {
    const router = (0, express_1.Router)();
    router.use(auth_middleware_1.authMiddleware);
    router.get('/', getProfileCtrl.handle);
    router.put('/', updateProfileCtrl.handle);
    return router;
}
//# sourceMappingURL=profiles.routes.js.map