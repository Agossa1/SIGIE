import { Request, Response, NextFunction } from 'express';
import { RecommendReportService } from '../services/recommend';

export class RecommendReportController {
    constructor(private readonly service: RecommendReportService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reportId = req.params.id as string;
            const { recommendation, suggestedMissionType, suggestedPriority, estimatedBudget, urgentFlag } = req.body;

            if (!recommendation) {
                res.status(400).json({ success: false, message: 'La recommandation est obligatoire' });
                return;
            }

            await this.service.execute({
                reportId,
                recommendation,
                suggestedMissionType,
                suggestedPriority,
                estimatedBudget,
                urgentFlag,
            });

            res.json({
                success: true,
                message: 'Signalement recommandé et aiguillé avec succès',
            });
        } catch (error) {
            next(error);
        }
    };
}