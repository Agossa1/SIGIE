import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repository';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { StaffTransfer } from '../types/teams.types';

export class TransferAgentService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly logger: Logger
    ) {}

    public async execute(data: StaffTransfer): Promise<void> {
        if (!data.old_team_id || !data.new_team_id) {
            throw new BadRequestError('Les IDs des équipes source et destination sont requis');
        }
        if (data.old_team_id === data.new_team_id) {
            throw new BadRequestError('L\'équipe de destination doit être différente de l\'équipe actuelle');
        }
        await this.teamRepository.transferMember(data);
        this.logger.info(`Agent ${data.user_id} transferred from ${data.old_team_id} to ${data.new_team_id}`);
    }
}