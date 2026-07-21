import { Request, Response, NextFunction } from 'express';
import { InterventionsService } from '../services/interventions.service';

/**
 * UpdateInterventionStatusController
 *
 * Responsabilité unique : extraire id + status de la requête HTTP,
 * déléguer la validation et la logique au service, retourner la réponse.
 */
export class UpdateInterventionStatusController {
    constructor(private readonly service: InterventionsService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;

            const intervention = await this.service.updateStatus({ id, status });

            res.json({ success: true, data: intervention });
        } catch (err) {
            next(err);
        }
    };
}