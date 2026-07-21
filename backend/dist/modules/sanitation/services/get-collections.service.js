"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCollectionsService = void 0;
class GetCollectionsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(municipalityId, status, page, limit) {
        return this.repository.getCollections(municipalityId, status, page, limit);
    }
}
exports.GetCollectionsService = GetCollectionsService;
//# sourceMappingURL=get-collections.service.js.map