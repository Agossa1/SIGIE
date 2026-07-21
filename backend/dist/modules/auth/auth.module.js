"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const auth_repositories_1 = require("./repositories/auth.repositories");
const tokenManager_1 = require("../../../src/config/tokens/tokenManager");
const passwordServices_1 = require("../../../src/config/passwords/passwordServices");
const authMailer_1 = require("../../../src/utils/mailer/authMailer");
const whatsapp_service_1 = require("../profiles/services/whatsapp.service");
const register_1 = require("./services/register");
const login_1 = require("./services/login");
const verify_1 = require("./services/verify");
const logout_1 = require("./services/logout");
const refreshToken_1 = require("./services/refreshToken");
const register_controller_1 = require("./controllers/register.controller");
const login_controller_1 = require("./controllers/login.controller");
const verify_controller_1 = require("./controllers/verify.controller");
const logout_controller_1 = require("./controllers/logout.controller");
const refreshToken_controller_1 = require("./controllers/refreshToken.controller");
/**
 * Module d'Authentification.
 * Centralise l'instanciation et l'injection de dépendances pour tout le domaine auth.
 */
class AuthModule {
    constructor(db, logger) {
        // 1. Repository & Utils
        const authRepository = new auth_repositories_1.AuthRepository(db, logger);
        const tokenManager = new tokenManager_1.TokenManager();
        const whatsappService = new whatsapp_service_1.WhatsAppService(logger);
        // 2. Services métiers
        const registerService = new register_1.RegisterService(authRepository, logger, authMailer_1.authMailer, passwordServices_1.passwordServiceInstance, whatsappService);
        const loginService = new login_1.LoginService(authRepository, logger, passwordServices_1.passwordServiceInstance, tokenManager);
        const verifyService = new verify_1.VerifyService(authRepository, logger, authMailer_1.authMailer);
        const logoutService = new logout_1.LogoutService(authRepository, logger);
        const refreshService = new refreshToken_1.RefreshTokenService(authRepository, logger, tokenManager);
        // 3. Contrôleurs
        this.registerController = new register_controller_1.RegisterController(registerService);
        this.loginController = new login_controller_1.LoginController(loginService);
        this.verifyController = new verify_controller_1.VerifyController(verifyService);
        this.logoutController = new logout_controller_1.LogoutController(logoutService);
        this.refreshController = new refreshToken_controller_1.RefreshTokenController(refreshService);
    }
}
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map