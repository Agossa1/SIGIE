import { Request, Response, NextFunction } from 'express';
import { CheckInAgentService } from '../services/check-in-agent.service';
import { z } from 'zod';

const checkInSchema = z.object({
    teamId: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number()
});

export class SelfCheckInController {
    constructor(private readonly checkInService: CheckInAgentService) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = checkInSchema.parse(req.body);
            const userId = (req as any).user?.id;

            await this.checkInService.execute({
                ...validatedData,
                userId: userId!
            });

            return res.json({
                success: true,
                message: 'Pointage GPS réussi'
            });
        } catch (error) {
            next(error);
        }
    };
}