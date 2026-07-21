import { Request, Response, NextFunction } from 'express';
import { UpdateTeamService } from '../services/update-team.service';
import { TeamMapper } from '../mappers/team.mapper';
import { z } from 'zod';

const updateTeamSchema = z.object({
    name: z.string().min(3).optional(),
    municipalityId: z.string().uuid().optional(),
    teamType: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'suspended', 'disabled']).optional()
});

export class UpdateTeamController {
    constructor(private readonly updateTeamService: UpdateTeamService) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const validatedData = updateTeamSchema.parse(req.body);
            
            const team = await this.updateTeamService.execute(id as string, validatedData);

            return res.json({
                success: true,
                message: 'Brigade mise à jour avec succès',
                data: TeamMapper.toDTO(team)
            });
        } catch (error) {
            next(error);
        }
    };
}