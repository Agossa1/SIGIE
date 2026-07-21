"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRegionsService = void 0;
class GetRegionsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() { return this.repository.getRegions(); }
}
exports.GetRegionsService = GetRegionsService;
//# sourceMappingURL=get-regions.service.js.map