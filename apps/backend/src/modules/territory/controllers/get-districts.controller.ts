import { Request, Response } from 'express';
import { GetDistrictsService } from '../services/get-districts.service';

export class GetDistrictsController {
    constructor(private readonly service: GetDistrictsService) {}
    handle = async (req: Request, res: Response) => {
        try {
            const rows = await this.service.execute(req.query.municipalityId as string);
            res.json({ success: true, data: rows });
        } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
    };
}