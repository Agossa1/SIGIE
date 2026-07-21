import { Request, Response, NextFunction } from 'express';
import { GetNatureService } from '../services/get-nature.service';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

export const getNatureController = (service: GetNatureService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const type = req.params.type as string;
            const municipalityId = req.query.municipalityId as string | undefined;

            const validTypes = ['protected_areas', 'urban_flora', 'environmental_sensors', 'waste_centers'];
            if (!validTypes.includes(type)) {
                throw new BadRequestError('Type de données nature invalide');
            }

            const geojson = await service.execute(
                type as any,
                municipalityId
            );

            res.status(200).json({ 
                success: true, 
                data: geojson 
            });
        } catch (error) {
            next(error);
        }
    };
};
