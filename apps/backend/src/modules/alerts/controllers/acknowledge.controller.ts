import { Request, Response, NextFunction } from 'express';
import { AcknowledgeAlertService } from '../services/acknowledge.service';

export class AcknowledgeAlertController {
    constructor(private readonly service: AcknowledgeAlertService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié' });
            const alertId = String(req.params.id);
            const alert = await this.service.execute(alertId, userId);
            if (!alert) return res.status(404).json({ success: false, message: 'Alerte introuvable' });
            res.json({ success: true, data: alert });
        } catch (e) { next(e); }
    };
}