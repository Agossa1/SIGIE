"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllGisLayersController = void 0;
class GetAllGisLayersController {
    constructor(service) {
        this.service = service;
        this.handle = async (_req, res, next) => {
            try {
                const layers = await this.service.execute();
                res.json({ success: true, data: layers });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetAllGisLayersController = GetAllGisLayersController;
//# sourceMappingURL=get-all.controller.js.map