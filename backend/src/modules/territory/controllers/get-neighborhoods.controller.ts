import { Request, Response } from 'express';
import { GetNeighborhoodsService } from '../services/get-neighborhoods.service';

export class GetNeighborhoodsController {
    constructor(private readonly service: GetNeighborhoodsService) {}
    handle = async (req: Request, res: Response) => {
        try {
            const rows = await this.service.execute(req.query.districtId as string);
            res.json({ success: true, data: rows });
        } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
    };
}