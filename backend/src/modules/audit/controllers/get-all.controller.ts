import { Request, Response, NextFunction } from 'express';
import { GetAllAuditLogsService } from '../services/get-all.service';

export class GetAllAuditLogsController {
    constructor(private readonly service: GetAllAuditLogsService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, action, tableName, from, to, page = '1', limit = '50' } = req.query;
            const result = await this.service.execute(
                {
                    userId: userId as string,
                    action: action as string,
                    tableName: tableName as string,
                    from: from as string,
                    to: to as string,
                },
                parseInt(page as string),
                parseInt(limit as string),
            );
            res.json({ success: true, ...result });
        } catch (e) { next(e); }
    };
}