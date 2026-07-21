"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNewBrigadeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateNewBrigadeService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    async execute(data) {
        if (data.name.length < 3) {
            throw new appErrors_1.BadRequestError('Le nom de la brigade est trop court');
        }
        this.logger.info(`Création d'une nouvelle brigade : ${data.name} pour l'organisation ${data.orgId}`);
        const team = await this.teamRepository.createTeam({
            name: data.name,
            organizationId: data.orgId,
            municipalityId: data.municipalityId,
            teamType: data.teamType,
            description: data.description
        });
        if (data.supervisorId) {
            await this.teamRepository.addMember(team.id, data.supervisorId, 'supervisor');
        }
        if (data.memberIds && Array.isArray(data.memberIds)) {
            for (const userId of data.memberIds) {
                if (userId !== data.supervisorId) {
                    await this.teamRepository.addMember(team.id, userId, 'member');
                }
            }
        }
        return team;
    }
}
exports.CreateNewBrigadeService = CreateNewBrigadeService;
//# sourceMappingURL=create-new-brigade.service.js.map