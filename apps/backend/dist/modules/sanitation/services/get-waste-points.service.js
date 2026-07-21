"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWastePointsService = void 0;
class GetWastePointsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(municipalityId, page, limit) {
        return this.repository.getWastePoints(municipalityId, page, limit);
    }
}
exports.GetWastePointsService = GetWastePointsService;
//# sourceMappingURL=get-waste-points.service.js.map