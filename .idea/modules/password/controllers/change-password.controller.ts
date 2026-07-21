import { Request, Response, NextFunction } from 'express';
import { ChangePasswordService } from '../services/change-password.service';
import { changePasswordSchema } from '../validations/password.validation';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class ChangePasswordController {
    constructor(private readonly service: ChangePasswordService) { }

    public changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = changePasswordSchema.parse(req.body);

            const userId = (req as any).user?.id;
            if (!userId) {
                throw new BadRequestError('Utilisateur non authentifié');
            }

            await this.service.changePassword(
                userId,
                validatedData.oldPassword,
                validatedData.newPassword
            );

            return res.status(200).json({
                success: true,
                message: 'Mot de passe modifié avec succès.'
            });
        } catch (error) {
            next(error);
        }
    }
}
