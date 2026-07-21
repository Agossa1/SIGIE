import { Request, Response, NextFunction } from 'express';
import { InterventionsTraceabilityService } from '../services/traceability.service';

export class GetTraceabilityController {
    constructor(private readonly service: InterventionsTraceabilityService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const chain = await this.service.getTraceabilityByReport(req.params.reportId as string);
            res.json({ success: true, data: chain });
        } catch (e) { next(e); }
    };
}