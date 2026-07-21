import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AssignMissionService } from '../services/assign.service';
import { ValidationError } from '../../../shared/errors/appErrors';
import { assignMissionSchema, missionIdParamSchema } from '../validations/missions.validations';

export class AssignMissionController {
    constructor(private readonly service: AssignMissionService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const validated = assignMissionSchema.parse(req.body);
            await this.service.execute(id, validated);
            res.status(200).json({ success: true, data: null, message: 'Utilisateurs assignés' });
        } catch (error) {
            next(error);
        }
    };
}