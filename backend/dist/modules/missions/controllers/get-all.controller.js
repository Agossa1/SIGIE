"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissionsController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const getMissionsController = (service) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user || !user.id) {
                throw new appErrors_1.UnauthorizedError('Utilisateur non authentifié');
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await service.execute(user.id, user.roles, user, page, limit);
            res.status(200).json({ success: true, ...result, message: 'Missions récupérées' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getMissionsController = getMissionsController;
//# sourceMappingURL=get-all.controller.js.map