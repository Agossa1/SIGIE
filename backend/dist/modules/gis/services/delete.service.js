"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGisLayerService = void 0;
class DeleteGisLayerService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        return this.repository.deleteLayer(id);
    }
}
exports.DeleteGisLayerService = DeleteGisLayerService;
//# sourceMappingURL=delete.service.js.map