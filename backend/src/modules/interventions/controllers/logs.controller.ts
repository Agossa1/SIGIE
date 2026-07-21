import { Request, Response, NextFunction } from 'express';
import { InterventionLogsService } from '../services/logs.service';
import type { CreateInterventionLogDTO } from '../types/logs.types';

export class InterventionLogsController {
    constructor(private readonly service: InterventionLogsService) {}

    /**
     * GET /api/interventions/:id/logs
     */
    getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const interventionId = req.params.id as string;
            const logs = await this.service.getLogs(interventionId);
            res.json({ success: true, data: logs });
        } catch (err) {
            next(err);
        }
    };

    /**
     * POST /api/interventions/:id/logs
     */
    createLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const interventionId = req.params.id as string;
            const user = (req as any).user;
            const dto: CreateInterventionLogDTO = {
                interventionId,
                authorId: user?.id,
                logType: req.body.logType,
                oldStatus: req.body.oldStatus,
                newStatus: req.body.newStatus,
                comment: req.body.comment,
            };
            await this.service.log(dto);
            res.status(201).json({ success: true, message: 'Log enregistré' });
        } catch (err) {
            next(err);
        }
    };
}