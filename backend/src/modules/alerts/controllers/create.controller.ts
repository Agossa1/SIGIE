import { Request, Response, NextFunction } from 'express';
import { CreateAlertService } from '../services/create.service';
import { createAlertSchema } from '../validations/alerts.validations';

export class CreateAlertController {
    constructor(private readonly service: CreateAlertService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createAlertSchema.parse(req.body);
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié' });
            const alert = await this.service.execute({ ...data, userId });
            res.status(201).json({ success: true, data: alert });
        } catch (e) { next(e); }
    };
}