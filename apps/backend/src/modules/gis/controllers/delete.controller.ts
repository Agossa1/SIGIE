import { Request, Response, NextFunction } from 'express';
import { DeleteGisLayerService } from '../services/delete.service';

export class DeleteGisLayerController {
    constructor(private readonly service: DeleteGisLayerService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const layerId = req.params.id as string;
            await this.service.execute(layerId);
            res.json({ success: true, message: 'Couche supprimée' });
        } catch (e) { next(e); }
    };
}