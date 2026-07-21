"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureAuthRoutes = void 0;
const express_1 = require("express");
const logger_1 = require("../../../../src/shared/loggers/logger");
const auth_module_1 = require("../auth.module");
/**
 * Configure les routes pour le module d'authentification.
 * @param db Instance de la base de données
 */
const configureAuthRoutes = (db) => {
    const router = (0, express_1.Router)();
    // Initialisation du module (Injection de dépendances centralisée)
    const authModule = new auth_module_1.AuthModule(db, logger_1.logger);
    // Définition des routes avec les contrôleurs du module
    router.post('/register', authModule.registerController.register);
    router.post('/login', authModule.loginController.login);
    router.post('/verify', authModule.verifyController.verify);
    router.post('/logout', authModule.logoutController.logout);
    router.post('/refresh-token', authModule.refreshController.refresh);
    return router;
};
exports.configureAuthRoutes = configureAuthRoutes;
//# sourceMappingURL=auth.routes.js.map