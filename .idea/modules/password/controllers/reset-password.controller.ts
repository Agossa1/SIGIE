import { Request, Response, NextFunction } from 'express';
import { ResetPasswordService } from '../services/reset-password.service';
import { resetPasswordSchema } from '../validations/password.validation';

export class ResetPasswordController {
    constructor(private readonly service: ResetPasswordService) { }

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            await this.service.resetPassword(
                validatedData.email,
                validatedData.otp,
                validatedData.newPassword
            );

            return res.status(200).json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
            });
        } catch (error) {
            next(error);
        }
    }
}
