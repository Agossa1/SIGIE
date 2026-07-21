import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UpdateMissionService } from '../services/update.service';
import { ValidationError } from '../../../shared/errors/appErrors';
import { updateMissionSchema, missionIdParamSchema } from '../validations/missions.validations';

export class UpdateMissionController {
    constructor(private readonly service: UpdateMissionService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const validated = updateMissionSchema.parse(req.body);
            await this.service.executeUpdate(id, validated as any);
            res.status(200).json({ success: true, data: null, message: 'Mission mise à jour' });
        } catch (error) {
            next(error);
        }
    };
}