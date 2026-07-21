"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNeighborhoodsService = void 0;
class GetNeighborhoodsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(districtId) {
        return this.repository.getNeighborhoods(districtId);
    }
}
exports.GetNeighborhoodsService = GetNeighborhoodsService;
//# sourceMappingURL=get-neighborhoods.service.js.map