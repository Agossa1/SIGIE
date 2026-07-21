"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWastePointService = void 0;
class CreateWastePointService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(data) {
        return this.repository.createWastePoint(data);
    }
}
exports.CreateWastePointService = CreateWastePointService;
//# sourceMappingURL=create-waste-point.service.js.map