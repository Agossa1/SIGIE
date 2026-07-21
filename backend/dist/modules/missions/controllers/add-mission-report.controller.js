"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMissionReportController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const missions_validations_1 = require("../validations/missions.validations");
class AddMissionReportController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
                const validated = missions_validations_1.createMissionReportSchema.parse(req.body);
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                await this.service.execute(id, user.id, validated);
                res.status(201).json({ success: true, data: null, message: 'Rapport ajouté avec succès' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AddMissionReportController = AddMissionReportController;
//# sourceMappingURL=add-mission-report.controller.js.map