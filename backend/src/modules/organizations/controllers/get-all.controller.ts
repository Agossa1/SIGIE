import { Request, Response, NextFunction } from 'express';
import { GetAllOrganizationsService } from '../services/get-all.service';

export class GetAllOrganizationsController {
    constructor(private readonly service: GetAllOrganizationsService) {}
    handle = async (_req: Request, res: Response, next: NextFunction) => {
        try { res.json({ success: true, data: await this.service.execute() }); } catch (e) { next(e); }
    };
}