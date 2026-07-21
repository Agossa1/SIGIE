import { Request, Response } from 'express';
import { GetRegionsService } from '../services/get-regions.service';

export class GetRegionsController {
    constructor(private readonly service: GetRegionsService) {}
    handle = async (_req: Request, res: Response) => {
        try {
            const rows = await this.service.execute();
            res.json({ success: true, data: rows });
        } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
    };
}