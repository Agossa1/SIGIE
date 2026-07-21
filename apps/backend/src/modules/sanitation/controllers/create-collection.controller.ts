import { Request, Response, NextFunction } from 'express';
import { CreateCollectionService } from '../services/create-collection.service';
import { createCollectionSchema } from '../validations/sanitation.validations';

export class CreateCollectionController {
    constructor(private readonly service: CreateCollectionService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createCollectionSchema.parse(req.body);
            const collection = await this.service.execute(data);
            res.status(201).json({ success: true, data: collection });
        } catch (e) { next(e); }
    };
}