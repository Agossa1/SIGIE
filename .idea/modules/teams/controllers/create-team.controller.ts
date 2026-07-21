import { Request, Response, NextFunction } from 'express';
import { CreateNewBrigadeService } from '../services/create-new-brigade.service';
import { TeamMapper } from '../mappers/team.mapper';
import { z } from 'zod';

const createTeamSchema = z.object({
    name: z.string().min(3, "Le nom doit avoir au moins 3 caractères"),
    municipalityId: z.string().uuid().optional(),
    teamType: z.string().optional(),
    description: z.string().optional(),
    supervisorId: z.string().uuid().optional(),
    memberIds: z.array(z.string().uuid()).optional()
});

export class CreateTeamController {
    constructor(private readonly createTeamService: CreateNewBrigadeService) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = createTeamSchema.parse(req.body);
            const orgId = (req as any).user?.organizationId;
            
            const team = await this.createTeamService.execute({
                ...validatedData,
                orgId: orgId!
            });

            return res.status(201).json({
                success: true,
                message: 'Brigade créée avec succès',
                data: TeamMapper.toDTO(team)
            });
        } catch (error) {
            next(error);
        }
    };
}