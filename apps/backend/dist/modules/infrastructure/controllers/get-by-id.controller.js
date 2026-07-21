"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInfrastructureByIdController = void 0;
class GetInfrastructureByIdController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const item = await this.service.execute(req.params.id);
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
exports.GetInfrastructureByIdController = GetInfrastructureByIdController;
//# sourceMappingURL=get-by-id.controller.js.map