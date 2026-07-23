import { Request, Response, NextFunction } from 'express';
import { ValidateByTeamService } from '../services/validate-by-team';

export class ValidateByTeamController {
    constructor(private readonly service: ValidateByTeamService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reportId = req.params.id as string;
            const userId = (req as any).user?.id;
            const { action, comment } = req.body;

            if (!action) {
                res.status(400).json({ success: false, message: 'L\'action (validate, reject, request_revision) est obligatoire' });
                return;
            }

            await this.service.execute({
                reportId,
                action,
                comment,
                validatedBy: userId,
            });

            res.json({
                success: true,
                message: `Signalement traité avec succès (action: ${action})`,
            });
        } catch (error) {
            next(error);
        }
    };
}