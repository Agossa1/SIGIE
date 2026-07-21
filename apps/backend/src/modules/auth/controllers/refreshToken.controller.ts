import { Request, Response, NextFunction } from "express";
import { RefreshTokenService } from "../services/refreshToken";
import { BadRequestError } from "../../../../src/shared/errors/appErrors";

export class RefreshTokenController {
    constructor(private readonly refreshService: RefreshTokenService) {}

    /**
     * Gère le rafraîchissement des tokens d'accès.
     */
    public refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

            if (!refreshToken) {
                throw new BadRequestError('Refresh token manquant');
            }

            const result = await this.refreshService.refresh(refreshToken);

            // Access Token (Courte durée)
            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            // Refresh Token (Longue durée)
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
            });

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
