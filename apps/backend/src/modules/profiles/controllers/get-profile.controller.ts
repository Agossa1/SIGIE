import { Request, Response, NextFunction } from 'express';
import { GetProfileService } from '../services/get-profile.service';

export class GetProfileController {
    constructor(private readonly service: GetProfileService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié' });
            const profile = await this.service.execute(userId);
            res.json({ success: true, data: profile });
        } catch (e) { next(e); }
    };
}