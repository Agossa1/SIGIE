"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReportController = void 0;
const create_validations_1 = require("../validations/create.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateReportController {
    constructor(service) {
        this.service = service;
        this.create = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                const dto = create_validations_1.createReportSchema.parse(req.body);
                const report = await this.service.execute(dto, user.id);
                return res.status(201).json({ success: true, data: report });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CreateReportController = CreateReportController;
//# sourceMappingURL=create.controller.js.map