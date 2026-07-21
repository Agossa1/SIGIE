"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllGisLayersService = void 0;
class GetAllGisLayersService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        return this.repository.getAllLayers();
    }
}
exports.GetAllGisLayersService = GetAllGisLayersService;
//# sourceMappingURL=get-all.service.js.map