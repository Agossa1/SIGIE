import { Request, Response, NextFunction } from 'express';
import { GetAllAlertsService } from '../services/get-all.service';

export class GetAllAlertsController {
    constructor(private readonly service: GetAllAlertsService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, severity, municipalityId, page, limit } = req.query;
            const alerts = await this.service.execute({
                type: type as string,
                severity: severity as string,
                municipalityId: municipalityId as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            });
            res.json({ success: true, data: alerts });
        } catch (e) { next(e); }
    };
}