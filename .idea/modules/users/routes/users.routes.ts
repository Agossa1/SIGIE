import { Router } from 'express';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { logger } from '../../../../apps/backend/src/shared/loggers/logger';
import { UsersModule } from '../users.module';
import { authMiddleware } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const usersRouter = (db: PostgresDatabase) => {
    const router = Router();
    const usersModule = new UsersModule(db, logger);

    router.get('/me', authMiddleware, usersModule.usersController.getMe);
    router.patch('/me', authMiddleware, usersModule.usersController.updateMe);
    router.get('/', authMiddleware, usersModule.usersController.getAllUsers);
    router.patch('/:id/roles', authMiddleware, usersModule.usersController.assignRole);

    return router;
};
