import { Router } from 'express';
import { MediaUploadController } from './controllers/create.controller';
import { CreateMediaService } from './services/create.service';
import multer from 'multer';
import { authMiddleware, requireRole } from '../../../apps/backend/src/shared/middlewares/auth.middleware';

export const setupMediaModule = (): Router => {
    const router = Router();
    
    // Multer configuration: Store in memory to process with Sharp before writing to disk
    const storage = multer.memoryStorage();
    const upload = multer({ 
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit before compression
        }
    });

    const createMediaService = new CreateMediaService();
    const mediaUploadController = new MediaUploadController(createMediaService);

    // Apply JWT auth
    router.use(authMiddleware);

    // Upload an image, specifically targeted for field ops with high compression
    router.post(
        '/upload',
        requireRole(['technician', 'field_agent', 'super_admin', 'platform_admin']),
        upload.single('file'), // Expecting form-data with key 'file'
        (req, res, next) => mediaUploadController.handle(req, res, next)
    );

    return router;
};
