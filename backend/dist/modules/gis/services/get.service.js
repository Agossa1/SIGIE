"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGisLayersService = void 0;
class GetGisLayersService {
    constructor(repository) {
        this.repository = repository;
    }
    async getLayers() {
        return this.repository.getLayers();
    }
    async getLayerGeoJson(layerId) {
        return this.repository.getLayerAsGeoJson(layerId);
    }
}
exports.GetGisLayersService = GetGisLayersService;
//# sourceMappingURL=get.service.js.map