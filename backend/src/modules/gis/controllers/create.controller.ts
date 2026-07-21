import { Request, Response, NextFunction } from 'express';
import { CreateGisLayerService } from '../services/create.service';

export class CreateGisLayerController {
    constructor(private readonly service: CreateGisLayerService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, layerType, description, municipalityId, geojson } = req.body;
            if (!name || !layerType || !geojson || !geojson.features) {
                return res.status(400).json({ success: false, message: 'name, layerType et geojson requis' });
            }
            const userId = (req as any).user?.id;
            const result = await this.service.execute({ name, layerType, description, municipalityId, userId, geojson });
            res.status(201).json({ success: true, data: result });
        } catch (e) { next(e); }
    };
}