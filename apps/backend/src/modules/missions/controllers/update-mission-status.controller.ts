import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UpdateMissionService } from '../services/update.service';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/appErrors';
import { updateMissionStatusSchema, missionIdParamSchema } from '../validations/missions.validations';

export class UpdateMissionStatusController {
    constructor(private readonly service: UpdateMissionService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const { status, forceCompleteInterventions } = updateMissionStatusSchema.parse(req.body);
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            await this.service.executeStatus(id, status, user.id, forceCompleteInterventions);
            res.status(200).json({ success: true, data: null, message: 'Statut mis à jour' });
        } catch (error) {
            next(error);
        }
    };
}