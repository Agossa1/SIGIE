"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGisLayerByIdService = void 0;
class GetGisLayerByIdService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        const result = await this.repository.getLayerWithFeatures(id);
        if (!result)
            return null;
        return {
            id: result.layer.id,
            name: result.layer.name,
            type: 'FeatureCollection',
            features: result.features.map((f) => f.featureData),
        };
    }
}
exports.GetGisLayerByIdService = GetGisLayerByIdService;
//# sourceMappingURL=get-by-id.service.js.map