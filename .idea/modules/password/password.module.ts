import PostgresDatabase from '../../../apps/backend/src/infra/database/postgres';
import type { Logger } from 'winston';
import { PasswordRepository } from './repositories/password.repository';
import { EmailService } from '../../../apps/backend/src/shared/services/email.service';
import { passwordServiceInstance } from '../../../apps/backend/src/config/passwords/passwordServices';

import { ForgotPasswordService } from './services/forgot-password.service';
import { ResetPasswordService } from './services/reset-password.service';
import { ChangePasswordService } from './services/change-password.service';
import { SetupPasswordService } from './services/setup-password.service';

import { ForgotPasswordController } from './controllers/forgot-password.controller';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { ChangePasswordController } from './controllers/change-password.controller';
import { SetupPasswordController } from './controllers/setup-password.controller';
import { VerifyCodeService } from './services/verify-code.service';
import { VerifyCodeController } from './controllers/verify-code.controller';

/**
 * Module de gestion de mot de passe (oubli, réinitialisation, changement).
 * Centralise l'instanciation et l'injection de dépendances pour ce domaine.
 */
export class PasswordModule {
    public readonly forgotPasswordController: ForgotPasswordController;
    public readonly resetPasswordController: ResetPasswordController;
    public readonly changePasswordController: ChangePasswordController;
    public readonly setupPasswordController: SetupPasswordController;
    public readonly verifyCodeController: VerifyCodeController;

    constructor(db: PostgresDatabase, logger: Logger) {
        // 1. Repository & Utils
        const passwordRepository = new PasswordRepository(db, logger);
        const emailService = new EmailService(logger);

        // 2. Services métiers
        const forgotPasswordService = new ForgotPasswordService(passwordRepository, emailService, logger);
        const resetPasswordService = new ResetPasswordService(passwordRepository, passwordServiceInstance, logger);
        const changePasswordService = new ChangePasswordService(passwordRepository, passwordServiceInstance, logger);
        const setupPasswordService = new SetupPasswordService(passwordRepository, passwordServiceInstance, logger);
        const verifyCodeService = new VerifyCodeService(passwordRepository, logger);

        // 3. Contrôleurs
        this.forgotPasswordController = new ForgotPasswordController(forgotPasswordService);
        this.resetPasswordController = new ResetPasswordController(resetPasswordService);
        this.changePasswordController = new ChangePasswordController(changePasswordService);
        this.setupPasswordController = new SetupPasswordController(setupPasswordService);
        this.verifyCodeController = new VerifyCodeController(verifyCodeService);
    }
}
