import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repository';

export class DeleteTeamService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly logger: Logger
    ) {}

    public async execute(id: string): Promise<void> {
        this.logger.warn(`Désactivation de la brigade : ${id}`);
        await this.teamRepository.deleteTeam(id);
    }
}