import { Router } from 'express';
import PostgresDatabase from '../../../infra/database/postgres';
import { logger } from '../../../shared/loggers/logger';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';
import { ReportsModule } from '../reports.module';

export const configureReportsRoutes = (db: PostgresDatabase) => {
    const router = Router();
    const module = new ReportsModule(db, logger);

    // Appliquer l'auth middleware à toutes les routes
    router.use(authMiddleware);

    // Routes de lecture — tout utilisateur authentifié
    router.get('/', module.controllers.get.getAll);
    router.get('/:id', module.controllers.get.getById);

    // Routes d'écriture — rôles autorisés
    const writeRoles = ['super_admin', 'platform_admin', 'supervisor', 'team_leader'];
    router.post('/', requireRole(writeRoles), module.controllers.create.create);
    router.put('/:id', requireRole(writeRoles), module.controllers.update.update);
    router.delete('/:id', requireRole(['super_admin', 'platform_admin']), module.controllers.delete.delete);
    router.post('/:id/comments', requireRole(writeRoles), module.controllers.comment.addComment);
    router.post('/:id/assign', requireRole(writeRoles), module.controllers.assign.assign);

    return router;
};
