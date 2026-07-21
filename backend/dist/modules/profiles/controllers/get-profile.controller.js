"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileController = void 0;
class GetProfileController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, message: 'Non authentifié' });
                const profile = await this.service.execute(userId);
                res.json({ success: true, data: profile });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetProfileController = GetProfileController;
//# sourceMappingURL=get-profile.controller.js.map