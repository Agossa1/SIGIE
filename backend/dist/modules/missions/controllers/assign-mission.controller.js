"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignMissionController = void 0;
const missions_validations_1 = require("../validations/missions.validations");
class AssignMissionController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
                const validated = missions_validations_1.assignMissionSchema.parse(req.body);
                await this.service.execute(id, validated);
                res.status(200).json({ success: true, data: null, message: 'Utilisateurs assignés' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AssignMissionController = AssignMissionController;
//# sourceMappingURL=assign-mission.controller.js.map