import { Request, Response, NextFunction } from 'express';
import { DeleteOrganizationService } from '../services/delete.service';

export class DeleteOrganizationController {
    constructor(private readonly service: DeleteOrganizationService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.service.execute(String(req.params.id));
            res.json({ success: true, message: 'Organisation supprimée' });
        } catch (e) { next(e); }
    };
}