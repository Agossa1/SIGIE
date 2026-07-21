"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutController = void 0;
class LogoutController {
    constructor(logoutService) {
        this.logoutService = logoutService;
        /**
         * Gère la déconnexion d'un utilisateur.
         */
        this.logout = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.LogoutController = LogoutController;
//# sourceMappingURL=logout.controller.js.map