import { Request, Response, NextFunction } from 'express';
import { GetAllGisLayersService } from '../services/get-all.service';

export class GetAllGisLayersController {
    constructor(private readonly service: GetAllGisLayersService) {}

    handle = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const layers = await this.service.execute();
            res.json({ success: true, data: layers });
        } catch (e) { next(e); }
    };
}