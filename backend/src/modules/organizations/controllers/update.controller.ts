import { Request, Response, NextFunction } from 'express';
import { UpdateOrganizationService } from '../services/update.service';
import { updateOrganizationSchema } from '../validations/organizations.validations';

export class UpdateOrganizationController {
    constructor(private readonly service: UpdateOrganizationService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = updateOrganizationSchema.parse(req.body);
            const org = await this.service.execute(String(req.params.id), data);
            res.json({ success: true, data: org });
        } catch (e) { next(e); }
    };
}