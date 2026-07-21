import { Request, Response, NextFunction } from 'express';
import { GetReportCategoriesService } from '../services/report-categories.service';

export class GetReportCategoriesController {
    constructor(private readonly service: GetReportCategoriesService) {}

    handle = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await this.service.execute();
            res.json({ success: true, data: categories });
        } catch (e) { next(e); }
    };
}