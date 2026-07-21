import { Request, Response, NextFunction } from 'express';
import { GetGisLayerByIdService } from '../services/get-by-id.service';

export class GetGisLayerByIdController {
    constructor(private readonly service: GetGisLayerByIdService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const layerId = req.params.id as string;
            const data = await this.service.execute(layerId);
            if (!data) return res.status(404).json({ success: false, message: 'Couche introuvable' });
            res.json({ success: true, data });
        } catch (e) { next(e); }
    };
}