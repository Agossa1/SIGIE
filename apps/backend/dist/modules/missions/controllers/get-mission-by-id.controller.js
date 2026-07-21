"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionByIdController = void 0;
const missions_validations_1 = require("../validations/missions.validations");
class GetMissionByIdController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
                const mission = await this.service.execute(id);
                res.status(200).json({ success: true, data: mission, message: 'Détails de la mission' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetMissionByIdController = GetMissionByIdController;
//# sourceMappingURL=get-mission-by-id.controller.js.map