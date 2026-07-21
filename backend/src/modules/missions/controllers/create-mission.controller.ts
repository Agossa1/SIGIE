import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CreateMissionService } from '../services/create.service';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/appErrors';
import { createMissionSchema } from '../validations/missions.validations';

export class CreateMissionController {
    constructor(private readonly service: CreateMissionService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validated = createMissionSchema.parse(req.body);
            const user = req.user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const id = await this.service.execute(validated as any, user.id);
            res.status(201).json({ success: true, data: { id }, message: 'Mission créée avec succès' });
        } catch (error) {
            next(error);
        }
    };
}