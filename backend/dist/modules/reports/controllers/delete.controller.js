"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReportController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteReportController {
    constructor(service) {
        this.service = service;
        this.delete = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                await this.service.execute(req.params.id, user.id);
                return res.status(200).json({ success: true, message: 'Signalement supprimé' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.DeleteReportController = DeleteReportController;
//# sourceMappingURL=delete.controller.js.map