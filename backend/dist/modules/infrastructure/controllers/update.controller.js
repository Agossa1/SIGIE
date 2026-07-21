"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInfrastructureController = void 0;
class UpdateInfrastructureController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { name, description, conditionStatus, latitude, longitude } = req.body;
                const item = await this.service.execute(req.params.id, {
                    name, description, conditionStatus, latitude, longitude,
                });
                if (!item)
                    return res.status(404).json({ success: false, message: 'Ouvrage introuvable' });
                res.json({ success: true, data: item });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.UpdateInfrastructureController = UpdateInfrastructureController;
//# sourceMappingURL=update.controller.js.map