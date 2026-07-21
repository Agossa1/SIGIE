"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcknowledgeAlertService = void 0;
class AcknowledgeAlertService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, userId) {
        return this.repository.acknowledge(id, userId);
    }
}
exports.AcknowledgeAlertService = AcknowledgeAlertService;
//# sourceMappingURL=acknowledge.service.js.map