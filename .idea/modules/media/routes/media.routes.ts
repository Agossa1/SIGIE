import { Router } from 'express';
import { uploadMiddleware } from '../../../../apps/backend/src/shared/middlewares/upload.middleware';
import { authMiddleware } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';
import { MediaController } from '../controllers/media.controller';
import { MediaService } from '../services/media.service';
import { CreateMediaService } from '../services/create.service';
import { MediaRepository } from '../repositories/media.repositories';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { logger } from '../../../../apps/backend/src/shared/loggers/logger';

export const mediaRouter = (db: PostgresDatabase) => {
    const router = Router();
    const repository = new MediaRepository(db, logger);
    const createMediaService = new CreateMediaService();
    const service = new MediaService(repository, createMediaService);
    const controller = new MediaController(service);

    router.post('/upload', authMiddleware, uploadMiddleware.single('image'), controller.uploadImage);

    return router;
};