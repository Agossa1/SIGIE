"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordRouter = void 0;
const express_1 = require("express");
const logger_1 = require("../../../shared/loggers/logger");
const password_module_1 = require("../password.module");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
/**
 * Configure les routes pour le module de mot de passe.
 * @param db Instance de la base de données
 */
const passwordRouter = (db) => {
    const router = (0, express_1.Router)();
    // Initialisation du module (Injection de dépendances centralisée)
    const passwordModule = new password_module_1.PasswordModule(db, logger_1.logger);
    // Définition des routes avec les contrôleurs du module
    router.post('/forgot-password', passwordModule.forgotPasswordController.forgotPassword);
    router.post('/verify-code', passwordModule.verifyCodeController.verifyCode);
    router.post('/reset-password', passwordModule.resetPasswordController.resetPassword);
    router.post('/setup-password', passwordModule.setupPasswordController.setupPassword);
    // Route protégée (utilisateur connecté)
    router.post('/change-password', auth_middleware_1.authMiddleware, passwordModule.changePasswordController.changePassword);
    return router;
};
exports.passwordRouter = passwordRouter;
//# sourceMappingURL=password.routes.js.map