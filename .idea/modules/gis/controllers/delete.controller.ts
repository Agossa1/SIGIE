import {DeleteGisLayerService} from '../services/delete.service';
import { Request, Response, NextFunction } from 'express';

/**
 * DELETE /gis/:id
 */
export const deleteGisLayerController = (service: DeleteGisLayerService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await service.execute(id as string);
            res.status(200).json({ success: true, message: 'Couche supprimée' });
        } catch (error) {
            next(error);
        }
    };
};
