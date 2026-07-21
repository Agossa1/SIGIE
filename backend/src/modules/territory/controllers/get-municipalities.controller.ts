import { Request, Response } from 'express';
import { GetMunicipalitiesService } from '../services/get-municipalities.service';

export class GetMunicipalitiesController {
    constructor(private readonly service: GetMunicipalitiesService) {}
    handle = async (req: Request, res: Response) => {
        try {
            const rows = await this.service.execute(req.query.regionId as string);
            res.json({ success: true, data: rows });
        } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
    };
}