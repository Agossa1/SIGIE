import { Request, Response, NextFunction } from 'express';
import { GetFieldOpsSummaryService } from '../services/summary.service';

export class GetFieldOpsSummaryController {
    constructor(private readonly service: GetFieldOpsSummaryService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const summary = await this.service.execute(user);
            res.json({ success: true, data: summary });
        } catch (e) { next(e); }
    };
}