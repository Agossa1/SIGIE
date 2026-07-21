import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AddMissionReportService } from '../services/report.service';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/appErrors';
import { createMissionReportSchema, missionIdParamSchema } from '../validations/missions.validations';

export class AddMissionReportController {
    constructor(private readonly service: AddMissionReportService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const validated = createMissionReportSchema.parse(req.body);
            const user = req.user;
            if (!user?.id) throw new UnauthorizedError();
            await this.service.execute(id, user.id, validated as any);
            res.status(201).json({ success: true, data: null, message: 'Rapport ajouté avec succès' });
        } catch (error) {
            next(error);
        }
    };
}