import { Request, Response, NextFunction } from 'express';
import { UpdateGisLayerService } from '../services/update.service';
import { UpdateGisLayerDTO } from '../types/gis.types';

export const updateGisLayerController = (service: UpdateGisLayerService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const dto: UpdateGisLayerDTO = req.body;
            dto.layerId = id; // Assure que l'ID correspond à l'URL
            const userRoles = (req as any).user?.roles || [];
            
            const updatedLayer = await service.execute(id, dto, userRoles);
            
            res.status(200).json({
                success: true,
                data: updatedLayer,
                message: 'Couche mise à jour avec succès',
            });
        } catch (error) {
            next(error);
        }
    };
};
