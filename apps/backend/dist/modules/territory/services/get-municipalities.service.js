"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMunicipalitiesService = void 0;
class GetMunicipalitiesService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(regionId) {
        return this.repository.getMunicipalities(regionId);
    }
}
exports.GetMunicipalitiesService = GetMunicipalitiesService;
//# sourceMappingURL=get-municipalities.service.js.map