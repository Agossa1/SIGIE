import { Router } from 'express';
import PostgresDatabase from '../../../../src/infra/database/postgres';
import { logger } from '../../../../src/shared/loggers/logger';
import { AuthModule } from '../auth.module';

/**
 * Configure les routes pour le module d'authentification.
 * @param db Instance de la base de données
 */
export const configureAuthRoutes = (db: PostgresDatabase) => {
    const router = Router();
    
    // Initialisation du module (Injection de dépendances centralisée)
    const authModule = new AuthModule(db, logger);

    // Définition des routes avec les contrôleurs du module
    router.post('/register', authModule.registerController.register);
    router.post('/login', authModule.loginController.login);
    router.post('/verify', authModule.verifyController.verify);
    router.post('/logout', authModule.logoutController.logout);
    router.post('/refresh-token', authModule.refreshController.refresh);

    return router;

};
