"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMissionStatusController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const missions_validations_1 = require("../validations/missions.validations");
class UpdateMissionStatusController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
                const { status, forceCompleteInterventions } = missions_validations_1.updateMissionStatusSchema.parse(req.body);
                const user = req.user;
                if (!user?.id)
                    throw new appErrors_1.UnauthorizedError();
                await this.service.executeStatus(id, status, user.id, forceCompleteInterventions);
                res.status(200).json({ success: true, data: null, message: 'Statut mis à jour' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UpdateMissionStatusController = UpdateMissionStatusController;
//# sourceMappingURL=update-mission-status.controller.js.map