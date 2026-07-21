import { Request, Response, NextFunction } from 'express';
import { DeleteTeamService } from '../services/delete-team.service';

export class DeleteTeamController {
    constructor(private readonly deleteTeamService: DeleteTeamService) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            
            await this.deleteTeamService.execute(id as string);

            return res.json({
                success: true,
                message: 'Brigade supprimée avec succès'
            });
        } catch (error) {
            next(error);
        }
    };
}