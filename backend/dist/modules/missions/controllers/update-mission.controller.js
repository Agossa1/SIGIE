"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMissionController = void 0;
const missions_validations_1 = require("../validations/missions.validations");
class UpdateMissionController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
                const validated = missions_validations_1.updateMissionSchema.parse(req.body);
                await this.service.executeUpdate(id, validated);
                res.status(200).json({ success: true, data: null, message: 'Mission mise à jour' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UpdateMissionController = UpdateMissionController;
//# sourceMappingURL=update-mission.controller.js.map