import { Request, Response, NextFunction } from 'express';
import { ForgotPasswordService } from '../services/forgot-password.service';
import { forgotPasswordSchema } from '../validations/password.validation';

export class ForgotPasswordController {
    constructor(private readonly service: ForgotPasswordService) { }

    public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            await this.service.forgotPassword(validatedData.email);

            return res.status(200).json({
                success: true,
                message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.'
            });
        } catch (error) {
            next(error);
        }
    }
}
