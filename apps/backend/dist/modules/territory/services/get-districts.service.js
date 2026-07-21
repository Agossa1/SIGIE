"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDistrictsService = void 0;
class GetDistrictsService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(municipalityId) {
        return this.repository.getDistricts(municipalityId);
    }
}
exports.GetDistrictsService = GetDistrictsService;
//# sourceMappingURL=get-districts.service.js.map