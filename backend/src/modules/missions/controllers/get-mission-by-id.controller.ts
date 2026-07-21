import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { GetMissionByIdService } from '../services/get-by-id.service';
import { ValidationError } from '../../../shared/errors/appErrors';
import { missionIdParamSchema } from '../validations/missions.validations';

export class GetMissionByIdController {
    constructor(private readonly service: GetMissionByIdService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const mission = await this.service.execute(id);
            res.status(200).json({ success: true, data: mission, message: 'Détails de la mission' });
        } catch (error) {
            next(error);
        }
    };
}