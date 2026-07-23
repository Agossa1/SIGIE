import { Request, Response, NextFunction } from 'express';
import { CreateMissionFromReportService } from '../services/create-from-report.service';
import { CreateMissionDTO, MissionType, PriorityLevel } from '../types/missions.types';

/**
 * Contrôleur : POST /api/missions/from-report/:reportId
 * Crée une mission directement depuis un signalement existant.
 */
export class CreateMissionFromReportController {
    constructor(private readonly service: CreateMissionFromReportService) {}

    handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reportId = req.params.reportId as string;
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
                return;
            }

            const dto: CreateMissionDTO = {
                title: req.body.title,
                description: req.body.description,
                missionType: req.body.missionType as MissionType,
                priorityLevel: req.body.priorityLevel as PriorityLevel,
                municipalityId: req.body.municipalityId,
                assignedTeamId: req.body.assignedTeamId,
                scheduledAt: req.body.scheduledAt,
                createdBy: userId,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                reportId: reportId,
                dueDate: req.body.dueDate,
                estimatedHours: req.body.estimatedHours,
                estimatedBudget: req.body.estimatedBudget,
            };

            const mission = await this.service.execute(dto);

            res.status(201).json({
                success: true,
                message: 'Mission créée avec succès depuis le signalement',
                data: mission,
            });
        } catch (error) {
            next(error);
        }
    };
}