import { Request, Response, NextFunction } from 'express';
import { VerifyCodeService } from '../services/verify-code.service';
import { verifyCodeSchema } from '../validations/password.validation';

export class VerifyCodeController {
    constructor(private readonly service: VerifyCodeService) { }

    public verifyCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = verifyCodeSchema.parse(req.body);
            await this.service.verifyCode(
                validatedData.email,
                validatedData.otp
            );

            return res.status(200).json({
                success: true,
                message: 'Le code OTP est valide.'
            });
        } catch (error) {
            next(error);
        }
    }
}
