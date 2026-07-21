"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordModule = void 0;
const password_repository_1 = require("./repositories/password.repository");
const email_service_1 = require("../../shared/services/email.service");
const passwordServices_1 = require("../../config/passwords/passwordServices");
const forgot_password_service_1 = require("./services/forgot-password.service");
const reset_password_service_1 = require("./services/reset-password.service");
const change_password_service_1 = require("./services/change-password.service");
const setup_password_service_1 = require("./services/setup-password.service");
const forgot_password_controller_1 = require("./controllers/forgot-password.controller");
const reset_password_controller_1 = require("./controllers/reset-password.controller");
const change_password_controller_1 = require("./controllers/change-password.controller");
const setup_password_controller_1 = require("./controllers/setup-password.controller");
const verify_code_service_1 = require("./services/verify-code.service");
const verify_code_controller_1 = require("./controllers/verify-code.controller");
/**
 * Module de gestion de mot de passe (oubli, réinitialisation, changement).
 * Centralise l'instanciation et l'injection de dépendances pour ce domaine.
 */
class PasswordModule {
    constructor(db, logger) {
        // 1. Repository & Utils
        const passwordRepository = new password_repository_1.PasswordRepository(db, logger);
        const emailService = new email_service_1.EmailService(logger);
        // 2. Services métiers
        const forgotPasswordService = new forgot_password_service_1.ForgotPasswordService(passwordRepository, emailService, logger);
        const resetPasswordService = new reset_password_service_1.ResetPasswordService(passwordRepository, passwordServices_1.passwordServiceInstance, logger);
        const changePasswordService = new change_password_service_1.ChangePasswordService(passwordRepository, passwordServices_1.passwordServiceInstance, logger);
        const setupPasswordService = new setup_password_service_1.SetupPasswordService(passwordRepository, passwordServices_1.passwordServiceInstance, logger);
        const verifyCodeService = new verify_code_service_1.VerifyCodeService(passwordRepository, logger);
        // 3. Contrôleurs
        this.forgotPasswordController = new forgot_password_controller_1.ForgotPasswordController(forgotPasswordService);
        this.resetPasswordController = new reset_password_controller_1.ResetPasswordController(resetPasswordService);
        this.changePasswordController = new change_password_controller_1.ChangePasswordController(changePasswordService);
        this.setupPasswordController = new setup_password_controller_1.SetupPasswordController(setupPasswordService);
        this.verifyCodeController = new verify_code_controller_1.VerifyCodeController(verifyCodeService);
    }
}
exports.PasswordModule = PasswordModule;
//# sourceMappingURL=password.module.js.map