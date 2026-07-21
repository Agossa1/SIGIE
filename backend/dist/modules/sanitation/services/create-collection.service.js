"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCollectionService = void 0;
class CreateCollectionService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(data) {
        return this.repository.createCollection(data);
    }
}
exports.CreateCollectionService = CreateCollectionService;
//# sourceMappingURL=create-collection.service.js.map