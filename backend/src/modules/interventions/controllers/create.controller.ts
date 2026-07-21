import { Request, Response, NextFunction } from 'express';
import { InterventionsService } from '../services/interventions.service';

/**
 * CreateInterventionController
 *
 * Responsabilité unique : extraire les paramètres HTTP, déléguer au service,
 * retourner la réponse HTTP normalisée.
 * Toute validation métier est dans InterventionsService.
 */
export class CreateInterventionController {
    constructor(private readonly service: InterventionsService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { missionId, interventionType } = req.body;
            const userId = (req as any).user?.id as string | undefined;

            if (!userId) {
                res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié.' } });
                return;
            }

            const intervention = await this.service.create({ missionId, interventionType, userId });

            res.status(201).json({ success: true, data: intervention });
        } catch (err) {
            next(err);
        }
    };
}