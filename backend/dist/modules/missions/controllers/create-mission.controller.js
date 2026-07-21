"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMissionController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const missions_validations_1 = require("../validations/missions.validations");
class CreateMissionController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const validated = missions_validations_1.createMissionSchema.parse(req.body);
                const user = req.user;
                if (!user || !user.id) {
                    throw new appErrors_1.UnauthorizedError('Utilisateur non authentifié');
                }
                const id = await this.service.execute(validated, user.id);
                res.status(201).json({ success: true, data: { id }, message: 'Mission créée avec succès' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CreateMissionController = CreateMissionController;
//# sourceMappingURL=create-mission.controller.js.map