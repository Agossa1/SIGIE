"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCollectionsController = void 0;
class GetCollectionsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { municipalityId, status, page, limit } = req.query;
                const collections = await this.service.execute(municipalityId, status, page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
                res.json({ success: true, data: collections });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetCollectionsController = GetCollectionsController;
//# sourceMappingURL=get-collections.controller.js.map