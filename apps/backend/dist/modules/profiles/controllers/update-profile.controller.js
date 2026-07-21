"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileController = void 0;
class UpdateProfileController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, message: 'Non authentifié' });
                const { language, theme, notifications, photoUrl } = req.body;
                const profile = await this.service.execute(userId, { language, theme, notifications, photoUrl });
                res.json({ success: true, data: profile });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.UpdateProfileController = UpdateProfileController;
//# sourceMappingURL=update-profile.controller.js.map