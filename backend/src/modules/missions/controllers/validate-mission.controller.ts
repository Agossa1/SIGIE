import { Request, Response, NextFunction } from 'express';
import { ValidateMissionService } from '../services/validate-mission.service';

export class ValidateMissionController {
    constructor(private readonly service: ValidateMissionService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const missionId = req.params.id as string;
            const userId = (req as any).user?.id;
            const { closureNote, actualCost } = req.body;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
                return;
            }

            const mission = await this.service.execute(missionId, userId, closureNote, actualCost);

            res.json({
                success: true,
                message: 'Mission validée avec succès',
                data: mission,
            });
        } catch (error) {
            next(error);
        }
    };
}