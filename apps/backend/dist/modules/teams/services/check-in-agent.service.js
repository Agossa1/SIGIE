"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInAgentService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const webSocket_1 = require("../../../config/sockets/webSocket");
class CheckInAgentService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    async execute(data) {
        // Validation de base des coordonnées
        if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
            throw new appErrors_1.BadRequestError('Coordonnées GPS invalides');
        }
        this.logger.info(`Agent ${data.userId} checking in for team ${data.teamId} at [${data.latitude}, ${data.longitude}]`);
        await this.teamRepository.logAttendance({
            user_id: data.userId,
            team_id: data.teamId,
            latitude: data.latitude,
            longitude: data.longitude
        });
        // Diffuser la nouvelle position à tous les superviseurs connectés en temps réel
        webSocket_1.wsService.broadcast('TEAM_LOCATION_UPDATE', {
            teamId: data.teamId,
            teamName: data.teamName ?? data.teamId,
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date().toISOString(),
        });
        this.logger.info(`[WS] Broadcasted TEAM_LOCATION_UPDATE for team ${data.teamId}`);
    }
}
exports.CheckInAgentService = CheckInAgentService;
//# sourceMappingURL=check-in-agent.service.js.map