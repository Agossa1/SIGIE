"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignReportController = void 0;
const assign_validations_1 = require("../validations/assign.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
class AssignReportController {
    constructor(service) {
        this.service = service;
        this.assign = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                const dto = assign_validations_1.createAssignmentSchema.parse(req.body);
                const report = await this.service.execute(req.params.id, user.id, dto);
                return res.status(200).json({ success: true, data: report });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AssignReportController = AssignReportController;
//# sourceMappingURL=assign.controller.js.map