"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInfrastructureController = void 0;
class CreateInfrastructureController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { name, infrastructureType, description, municipalityId, conditionStatus, latitude, longitude } = req.body;
                const userId = req.user?.id;
                const item = await this.service.execute({
                    name, infrastructureType, description, municipalityId, conditionStatus, latitude, longitude, userId,
                });
                res.status(201).json({ success: true, data: item });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.CreateInfrastructureController = CreateInfrastructureController;
//# sourceMappingURL=create.controller.js.map