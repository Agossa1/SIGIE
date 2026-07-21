import PostgresDatabase from '../../infra/database/postgres';
import type { Logger } from 'winston';
import { AuthRepository } from './repositories/auth.repositories';
import { TokenManager } from '../../config/tokens/tokenManager';
import { passwordServiceInstance } from '../../config/passwords/passwordServices';
import { authMailer } from '../../utils/mailer/authMailer';
import { WhatsAppService } from '../profiles/services/whatsapp.service';
import { RegisterService } from './services/register';
import { LoginService } from './services/login';
import { VerifyService } from './services/verify';
import { LogoutService } from './services/logout';
import { RefreshTokenService } from './services/refreshToken';

import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { VerifyController } from './controllers/verify.controller';
import { LogoutController } from './controllers/logout.controller';
import { RefreshTokenController } from './controllers/refreshToken.controller';

/**
 * Module d'Authentification.
 * Centralise l'instanciation et l'injection de dépendances pour tout le domaine auth.
 */
export class AuthModule {
    public readonly registerController: RegisterController;
    public readonly loginController: LoginController;
    public readonly verifyController: VerifyController;
    public readonly logoutController: LogoutController;
    public readonly refreshController: RefreshTokenController;

    constructor(db: PostgresDatabase, logger: Logger) {
        // 1. Repository & Utils
        const authRepository = new AuthRepository(db, logger);
        const tokenManager = new TokenManager();
        const whatsappService = new WhatsAppService(logger);
        // 2. Services métiers
        const registerService = new RegisterService(authRepository, logger, authMailer, passwordServiceInstance, whatsappService);
        const loginService = new LoginService(authRepository, logger, passwordServiceInstance, tokenManager);
        const verifyService = new VerifyService(authRepository, logger, authMailer);
        const logoutService = new LogoutService(authRepository, logger);
        const refreshService = new RefreshTokenService(authRepository, logger, tokenManager);

        // 3. Contrôleurs
        this.registerController = new RegisterController(registerService);
        this.loginController = new LoginController(loginService);
        this.verifyController = new VerifyController(verifyService);
        this.logoutController = new LogoutController(logoutService);
        this.refreshController = new RefreshTokenController(refreshService);
    }
}

