import { Request, Response, NextFunction } from 'express';
import { CreateOrganizationService } from '../services/create.service';
import { createOrganizationSchema } from '../validations/organizations.validations';

export class CreateOrganizationController {
    constructor(private readonly service: CreateOrganizationService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createOrganizationSchema.parse(req.body);
            const org = await this.service.execute(data);
            res.status(201).json({ success: true, data: org });
        } catch (e) { next(e); }
    };
}