"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGisLayerController = void 0;
class CreateGisLayerController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { name, layerType, description, municipalityId, geojson } = req.body;
                if (!name || !layerType || !geojson || !geojson.features) {
                    return res.status(400).json({ success: false, message: 'name, layerType et geojson requis' });
                }
                const userId = req.user?.id;
                const result = await this.service.execute({ name, layerType, description, municipalityId, userId, geojson });
                res.status(201).json({ success: true, data: result });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.CreateGisLayerController = CreateGisLayerController;
//# sourceMappingURL=create.controller.js.map