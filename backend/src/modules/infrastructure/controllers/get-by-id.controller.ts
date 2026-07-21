import { Request, Response, NextFunction } from 'express';
import { GetInfrastructureByIdService } from '../services/get-by-id.service';

export class GetInfrastructureByIdController {
    constructor(private readonly service: GetInfrastructureByIdService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const item = await this.service.execute(req.params.id as string);
            if (!item) return res.status(404).json({ success: false, message: 'Ouvrage introuvable' });
            res.json({ success: true, data: item });
        } catch (e) { next(e); }
    };
}