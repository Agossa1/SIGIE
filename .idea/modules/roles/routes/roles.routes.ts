import { Router } from 'express';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { logger } from '../../../../apps/backend/src/shared/loggers/logger';
import { RolesModule } from '../roles.module';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const rolesRouter = (db: PostgresDatabase) => {
    const router = Router();
    const rolesModule = new RolesModule(db, logger);

    router.get('/', authMiddleware, requireRole('super_admin'), rolesModule.rolesController.getAllRoles);
    router.put('/:id', authMiddleware, requireRole('super_admin'), rolesModule.rolesController.updateRole);

    return router;
};
