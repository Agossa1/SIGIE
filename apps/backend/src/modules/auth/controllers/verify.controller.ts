import { Request, Response, NextFunction } from 'express';
import { VerifyService } from '../services/verify';
import { verifyAccountSchema } from '../validations/verify.validations';

/**
 * Contrôleur gérant la vérification des comptes utilisateurs via OTP.
 */
export class VerifyController {
    constructor(private readonly verifyService: VerifyService) {}

    /**
     * Valide le code OTP envoyé par l'utilisateur.
     */
    public verify = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Validation Zod (ID utilisateur et Code 6 chiffres)
            const validatedData = verifyAccountSchema.parse(req.body);

            // 2. Appel au service de vérification métier
            await this.verifyService.verifyAccount(
                validatedData.email,
                validatedData.code
            );

            // 3. Réponse de succès
            return res.status(200).json({
                success: true,
                message: 'Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.'
            });

        } catch (error) {
            // Transfert vers le middleware global de gestion d'erreurs
            next(error);
        }
    }
}
