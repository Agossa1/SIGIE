import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repository';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { wsService } from '../../../../apps/backend/src/config/sockets/webSocket';

export class CheckInAgentService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly logger: Logger
    ) {}

    public async execute(data: {
        userId: string;
        teamId: string;
        teamName?: string;
        latitude: number;
        longitude: number;
    }): Promise<void> {
        // Validation de base des coordonnées
        if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
            throw new BadRequestError('Coordonnées GPS invalides');
        }

        this.logger.info(`Agent ${data.userId} checking in for team ${data.teamId} at [${data.latitude}, ${data.longitude}]`);
        
        await this.teamRepository.logAttendance({
            user_id: data.userId,
            team_id: data.teamId,
            latitude: data.latitude,
            longitude: data.longitude
        });

        // Diffuser la nouvelle position à tous les superviseurs connectés en temps réel
        wsService.broadcast('TEAM_LOCATION_UPDATE', {
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