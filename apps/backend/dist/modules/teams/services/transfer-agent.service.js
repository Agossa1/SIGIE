"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferAgentService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class TransferAgentService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    async execute(data) {
        if (!data.old_team_id || !data.new_team_id) {
            throw new appErrors_1.BadRequestError('Les IDs des équipes source et destination sont requis');
        }
        if (data.old_team_id === data.new_team_id) {
            throw new appErrors_1.BadRequestError('L\'équipe de destination doit être différente de l\'équipe actuelle');
        }
        await this.teamRepository.transferMember(data);
        this.logger.info(`Agent ${data.user_id} transferred from ${data.old_team_id} to ${data.new_team_id}`);
    }
}
exports.TransferAgentService = TransferAgentService;
//# sourceMappingURL=transfer-agent.service.js.map