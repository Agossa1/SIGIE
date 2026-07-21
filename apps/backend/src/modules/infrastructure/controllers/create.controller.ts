import { Request, Response, NextFunction } from 'express';
import { CreateInfrastructureService } from '../services/create.service';

export class CreateInfrastructureController {
    constructor(private readonly service: CreateInfrastructureService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, infrastructureType, description, municipalityId, conditionStatus, latitude, longitude } = req.body;
            const userId = (req as any).user?.id;
            const item = await this.service.execute({
                name, infrastructureType, description, municipalityId, conditionStatus, latitude, longitude, userId,
            });
            res.status(201).json({ success: true, data: item });
        } catch (e) { next(e); }
    };
}