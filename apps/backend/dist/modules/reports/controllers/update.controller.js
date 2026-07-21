"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReportController = void 0;
const update_validations_1 = require("../validations/update.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateReportController {
    constructor(service) {
        this.service = service;
        this.update = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                const dto = update_validations_1.updateReportSchema.parse(req.body);
                const report = await this.service.execute(req.params.id, dto, user.id);
                return res.status(200).json({ success: true, data: report });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UpdateReportController = UpdateReportController;
//# sourceMappingURL=update.controller.js.map