"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCampaignsController = void 0;
class GetCampaignsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { municipalityId, page, limit } = req.query;
                const campaigns = await this.service.execute(municipalityId, page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined);
                res.json({ success: true, data: campaigns });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetCampaignsController = GetCampaignsController;
//# sourceMappingURL=get-campaigns.controller.js.map