import { Request, Response, NextFunction } from 'express';
import { InterventionsRepository } from '../repositories/interventions.repository';

export class GetAllInterventionsController {
    constructor(private readonly repo: InterventionsRepository) {}
    handle = async (_req: Request, res: Response, next: NextFunction) => {
        try { res.json({ success: true, data: await this.repo.getAll() }); } catch (e) { next(e); }
    };
}