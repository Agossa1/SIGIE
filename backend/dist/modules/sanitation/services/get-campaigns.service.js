"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCampaignsService = void 0;
class GetCampaignsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(municipalityId, page, limit) {
        return this.repository.getCampaigns(municipalityId, page, limit);
    }
}
exports.GetCampaignsService = GetCampaignsService;
//# sourceMappingURL=get-campaigns.service.js.map