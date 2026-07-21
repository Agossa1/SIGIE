import { Request, Response, NextFunction } from 'express';
import { UpdateInfrastructureService } from '../services/update.service';

export class UpdateInfrastructureController {
    constructor(private readonly service: UpdateInfrastructureService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, description, conditionStatus, latitude, longitude } = req.body;
            const item = await this.service.execute(req.params.id as string, {
                name, description, conditionStatus, latitude, longitude,
            });
            if (!item) return res.status(404).json({ success: false, message: 'Ouvrage introuvable' });
            res.json({ success: true, data: item });
        } catch (e) { next(e); }
    };
}