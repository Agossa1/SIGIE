"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGisLayerByIdController = void 0;
class GetGisLayerByIdController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const layerId = req.params.id;
                const data = await this.service.execute(layerId);
                if (!data)
                    return res.status(404).json({ success: false, message: 'Couche introuvable' });
                res.json({ success: true, data });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetGisLayerByIdController = GetGisLayerByIdController;
//# sourceMappingURL=get-by-id.controller.js.map