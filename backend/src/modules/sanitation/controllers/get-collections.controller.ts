import { Request, Response, NextFunction } from 'express';
import { GetCollectionsService } from '../services/get-collections.service';

export class GetCollectionsController {
    constructor(private readonly service: GetCollectionsService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, status, page, limit } = req.query;
            const collections = await this.service.execute(
                municipalityId as string, status as string,
                page ? parseInt(page as string) : undefined,
                limit ? parseInt(limit as string) : undefined,
            );
            res.json({ success: true, data: collections });
        } catch (e) { next(e); }
    };
}