"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAlertService = void 0;
class CreateAlertService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(data) {
        return this.repository.create({
            ...data,
            severity: data.severity || 'info',
        });
    }
}
exports.CreateAlertService = CreateAlertService;
//# sourceMappingURL=create.service.js.map