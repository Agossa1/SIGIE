import { Request, Response, NextFunction } from 'express';
import { DeleteInfrastructureService } from '../services/delete.service';

export class DeleteInfrastructureController {
    constructor(private readonly service: DeleteInfrastructureService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.service.execute(req.params.id as string);
            res.json({ success: true, message: 'Ouvrage supprimé' });
        } catch (e) { next(e); }
    };
}