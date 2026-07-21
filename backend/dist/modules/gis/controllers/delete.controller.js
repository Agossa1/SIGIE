"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGisLayerController = void 0;
class DeleteGisLayerController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const layerId = req.params.id;
                await this.service.execute(layerId);
                res.json({ success: true, message: 'Couche supprimée' });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.DeleteGisLayerController = DeleteGisLayerController;
//# sourceMappingURL=delete.controller.js.map