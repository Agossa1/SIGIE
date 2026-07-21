import { Request, Response, NextFunction } from 'express';
import { GetCampaignsService } from '../services/get-campaigns.service';

export class GetCampaignsController {
    constructor(private readonly service: GetCampaignsService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { municipalityId, page, limit } = req.query;
            const campaigns = await this.service.execute(
                municipalityId as string,
                page ? parseInt(page as string) : undefined,
                limit ? parseInt(limit as string) : undefined,
            );
            res.json({ success: true, data: campaigns });
        } catch (e) { next(e); }
    };
}