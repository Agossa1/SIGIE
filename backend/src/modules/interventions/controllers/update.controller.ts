import { Request, Response, NextFunction } from 'express';
import { InterventionsService } from '../services/interventions.service';

/**
 * UpdateInterventionController
 */
export class UpdateInterventionController {
    constructor(private readonly service: InterventionsService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            
            const intervention = await this.service.updateIntervention(id, req.body);

            res.json({ success: true, data: intervention });
        } catch (err) {
            next(err);
        }
    };
}