import { Request, Response, NextFunction } from 'express';
import { InterventionsStatsService } from '../services/stats.service';

export class GetInterventionsStatsController {
    constructor(private readonly service: InterventionsStatsService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, dateFrom, dateTo } = req.query;
            const stats = await this.service.getStats({
                municipalityId: municipalityId as string,
                dateFrom: dateFrom as string,
                dateTo: dateTo as string,
            });
            res.json({ success: true, data: stats });
        } catch (e) { next(e); }
    };
}