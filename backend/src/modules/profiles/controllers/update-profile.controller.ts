import { Request, Response, NextFunction } from 'express';
import { UpdateProfileService } from '../services/update-profile.service';

export class UpdateProfileController {
    constructor(private readonly service: UpdateProfileService) {}

    handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié' });
            const { language, theme, notifications, photoUrl } = req.body;
            const profile = await this.service.execute(userId, { language, theme, notifications, photoUrl });
            res.json({ success: true, data: profile });
        } catch (e) { next(e); }
    };
}