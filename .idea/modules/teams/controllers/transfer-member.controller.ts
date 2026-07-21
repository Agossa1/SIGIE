import { Request, Response, NextFunction } from 'express';
import { TransferAgentService } from '../services/transfer-agent.service';
import { z } from 'zod';

const transferSchema = z.object({
    user_id: z.string().uuid(),
    old_team_id: z.string().uuid(),
    new_team_id: z.string().uuid(),
    reason: z.string().optional()
});

export class TransferMemberController {
    constructor(private readonly transferService: TransferAgentService) {}

    public handle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = transferSchema.parse(req.body);
            const adminId = (req as any).user?.id;
            
            await this.transferService.execute({
                ...validatedData,
                transferred_by: adminId!,
                created_at: new Date(),
                id: '' // Généré par le repository
            });

            return res.json({
                success: true,
                message: 'Agent transféré avec succès'
            });
        } catch (error) {
            next(error);
        }
    };
}