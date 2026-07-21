import { Request, Response, NextFunction } from 'express';
import { GetOrganizationByIdService } from '../services/get-by-id.service';

export class GetOrganizationByIdController {
    constructor(private readonly service: GetOrganizationByIdService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const org = await this.service.execute(String(req.params.id));
            res.json({ success: true, data: org });
        } catch (e) { next(e); }
    };
}