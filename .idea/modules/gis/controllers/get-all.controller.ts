import { Request, Response, NextFunction } from 'express';
import { GetAllGisLayersService } from '../services/get-all.service';

/**
 * GET /gis
 * Retourne la liste de toutes les couches SIG.
 */
export const getAllGisLayersController = (service: GetAllGisLayersService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const layers = await service.execute();
            res.status(200).json({ success: true, data: layers });
        } catch (error) {
            next(error);
        }
    };
};
