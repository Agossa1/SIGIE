"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGisLayerService = void 0;
class CreateGisLayerService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(data) {
        return this.repository.createLayer(data);
    }
}
exports.CreateGisLayerService = CreateGisLayerService;
//# sourceMappingURL=create.service.js.map