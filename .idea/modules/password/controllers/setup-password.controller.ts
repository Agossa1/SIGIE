import { Request, Response, NextFunction } from 'express';
import { SetupPasswordService } from '../services/setup-password.service';
import { z } from 'zod';

const setupPasswordSchema = z.object({
    email: z.string().email(),
    token: z.string().min(1),
    newPassword: z.string().min(8)
});

export class SetupPasswordController {
    constructor(private readonly service: SetupPasswordService) {}

    public setupPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = setupPasswordSchema.parse(req.body);
            await this.service.setupPassword(data.email, data.token, data.newPassword);

            return res.status(200).json({
                success: true,
                message: 'Votre mot de passe a été configuré avec succès. Vous pouvez maintenant vous connecter.'
            });
        } catch (error) {
            next(error);
        }
    }
}
