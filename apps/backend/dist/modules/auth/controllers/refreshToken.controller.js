"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenController = void 0;
const appErrors_1 = require("../../../../src/shared/errors/appErrors");
class RefreshTokenController {
    constructor(refreshService) {
        this.refreshService = refreshService;
        /**
         * Gère le rafraîchissement des tokens d'accès.
         */
        this.refresh = async (req, res, next) => {
            try {
                const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
                if (!refreshToken) {
                    throw new appErrors_1.BadRequestError('Refresh token manquant');
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
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.RefreshTokenController = RefreshTokenController;
//# sourceMappingURL=refreshToken.controller.js.map