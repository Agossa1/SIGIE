import { Request, Response, NextFunction } from 'express';
import { GetWastePointsService } from '../services/get-waste-points.service';

export class GetWastePointsController {
    constructor(private readonly service: GetWastePointsService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, page, limit } = req.query;
            const points = await this.service.execute(
                municipalityId as string,
                page ? parseInt(page as string) : undefined,
                limit ? parseInt(limit as string) : undefined,
            );
            res.json({ success: true, data: points });
        } catch (e) { next(e); }
    };
}