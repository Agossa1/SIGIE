"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionsController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetMissionsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user || !user.id)
                    throw new appErrors_1.UnauthorizedError();
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const result = await this.service.execute(user.id, user.roles, user, page, limit);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    meta: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages
                    },
                    message: 'Missions récupérées'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetMissionsController = GetMissionsController;
//# sourceMappingURL=get-missions.controller.js.map