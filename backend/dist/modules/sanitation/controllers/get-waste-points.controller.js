"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWastePointsController = void 0;
class GetWastePointsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { municipalityId, page, limit } = req.query;
                const points = await this.service.execute(municipalityId, page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
                res.json({ success: true, data: points });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetWastePointsController = GetWastePointsController;
//# sourceMappingURL=get-waste-points.controller.js.map