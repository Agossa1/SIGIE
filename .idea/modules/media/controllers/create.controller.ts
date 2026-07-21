import { Request, Response, NextFunction } from 'express';
import { CreateMediaService } from '../services/create.service';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class MediaUploadController {
    constructor(private readonly createMediaService: CreateMediaService) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                throw new BadRequestError('No file provided');
            }

            const userId = req.user?.id;
            if (!userId) {
                throw new BadRequestError('User not authenticated');
            }

            const result = await this.createMediaService.processAndSaveImage(req.file, userId);

            res.status(201).json({
                success: true,
                message: 'Image uploaded and optimized successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
