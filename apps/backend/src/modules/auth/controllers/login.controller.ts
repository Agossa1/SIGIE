import { Request, Response, NextFunction } from 'express';
import { LoginService } from '../services/login';
import { loginSchema } from '../validations/login.validations';

/**
 * Contrôleur gérant l'authentification des utilisateurs.
 */
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    /**
     * Authentifie un utilisateur et initialise une session sécurisée via cookies HttpOnly.
     */
    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Validation des données d'entrée
            const validatedData = loginSchema.parse(req.body);

            // 2. Appel au service métier pour authentification
            const { user, accessToken, refreshToken } = await this.loginService.login(
                validatedData.identifier,
                validatedData.password
            );

            // 3. Sécurisation des tokens dans des cookies HttpOnly
            // L'utilisation de cookies HttpOnly protège les tokens contre le vol via scripts (XSS).

            // Access Token (Courte durée)
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            // Refresh Token (Longue durée)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });

            // 4. Réponse au client
            // Token renvoyé dans le JSON pour les clients mobiles (Expo)
            // ET dans un cookie HttpOnly pour les clients web (sécurité maximale)
            return res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: {
                    accessToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        roles: user.roles
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }
}
