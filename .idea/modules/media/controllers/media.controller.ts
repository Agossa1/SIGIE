import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/media.service';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    uploadImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                throw new BadRequestError('Aucun fichier téléchargé');
            }

            const { relatedId, relatedType } = req.body;
            if (!relatedId || !relatedType) {
                throw new BadRequestError('relatedId et relatedType sont requis');
            }

            const uploaderId = req.user!.id;
            const result = await this.mediaService.processUpload(req.file, relatedId, relatedType, uploaderId);

            res.status(201).json({ id: result.id, message: 'Image téléchargée avec succès', url: result.url });
        } catch (error) {
            next(error);
        }
    };
}