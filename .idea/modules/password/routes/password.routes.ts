import { Router } from 'express';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { logger } from '../../../../apps/backend/src/shared/loggers/logger';
import { PasswordModule } from '../password.module';
import { authMiddleware } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

/**
 * Configure les routes pour le module de mot de passe.
 * @param db Instance de la base de données
 */
export const passwordRouter = (db: PostgresDatabase) => {
    const router = Router();
    
    // Initialisation du module (Injection de dépendances centralisée)
    const passwordModule = new PasswordModule(db, logger);

    // Définition des routes avec les contrôleurs du module
    router.post('/forgot-password', passwordModule.forgotPasswordController.forgotPassword);
    router.post('/verify-code', passwordModule.verifyCodeController.verifyCode);
    router.post('/reset-password', passwordModule.resetPasswordController.resetPassword);
    router.post('/setup-password', passwordModule.setupPasswordController.setupPassword);

    // Route protégée (utilisateur connecté)
    router.post('/change-password', authMiddleware, passwordModule.changePasswordController.changePassword);

    return router;
};
