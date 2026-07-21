"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInterventionService = void 0;
class CreateInterventionService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto) {
        return this.repository.createIntervention(dto);
    }
}
exports.CreateInterventionService = CreateInterventionService;
//# sourceMappingURL=create.service.js.map