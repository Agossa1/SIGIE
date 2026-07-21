"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateMissionService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, userId) {
        // Validation optionnelle : si une équipe est spécifiée, vérifier qu'elle existe
        if (dto.assignedTeamId) {
            const teamExists = await this.repository.checkTeamExists(dto.assignedTeamId);
            if (!teamExists) {
                throw new appErrors_1.BadRequestError(`L'équipe assignée (ID: ${dto.assignedTeamId}) n'existe pas.`);
            }
        }
        return this.repository.createMission({
            ...dto,
            createdBy: userId
        });
    }
}
exports.CreateMissionService = CreateMissionService;
//# sourceMappingURL=create.service.js.map