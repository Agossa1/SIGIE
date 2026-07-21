import { Request, Response, NextFunction } from 'express';
import { CreateWastePointService } from '../services/create-waste-point.service';
import { createWastePointSchema } from '../validations/sanitation.validations';

export class CreateWastePointController {
    constructor(private readonly service: CreateWastePointService) {}
    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = createWastePointSchema.parse(req.body);
            const point = await this.service.execute(data);
            res.status(201).json({ success: true, data: point });
        } catch (e) { next(e); }
    };
}