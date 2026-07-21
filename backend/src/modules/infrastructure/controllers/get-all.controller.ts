import { Request, Response, NextFunction } from 'express';
import { GetAllInfrastructureService } from '../services/get-all.service';

export class GetAllInfrastructureController {
    constructor(private readonly service: GetAllInfrastructureService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, municipalityId, status, page = '1', limit = '20' } = req.query;
            const result = await this.service.execute(
                {
                    type: type as string,
                    municipalityId: municipalityId as string,
                    status: status as string,
                },
                parseInt(page as string),
                parseInt(limit as string),
            );
            res.json({ success: true, ...result });
        } catch (e) { next(e); }
    };
}