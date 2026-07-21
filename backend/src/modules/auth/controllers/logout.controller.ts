import { Request, Response, NextFunction } from "express";
import { LogoutService } from "../services/logout";

export class LogoutController {
    constructor(private readonly logoutService: LogoutService) {}

    /**
     * Gère la déconnexion d'un utilisateur.
     */
    public logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Le refresh token peut être passé dans le body ou les cookies
            const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

            if (refreshToken) {
                await this.logoutService.logout(refreshToken);
            }

            // On efface proprement les cookies de session
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });

            return res.status(200).json({
                success: true,
                message: 'Déconnexion réussie'
            });
        } catch (error) {
            next(error);
        }
    }
}
