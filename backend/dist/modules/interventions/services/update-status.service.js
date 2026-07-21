"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterventionStatusService = void 0;
class UpdateInterventionStatusService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, status) {
        return this.repository.updateInterventionStatus(id, status);
    }
}
exports.UpdateInterventionStatusService = UpdateInterventionStatusService;
//# sourceMappingURL=update-status.service.js.map