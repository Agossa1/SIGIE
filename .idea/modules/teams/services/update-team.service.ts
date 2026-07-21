import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repository';
import { Team } from '../types/teams.types';

export class UpdateTeamService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly logger: Logger
    ) {}

    public async execute(id: string, data: Partial<Team>): Promise<Team> {
        this.logger.info(`Mise à jour de la brigade : ${id}`);
        // On pourrait ajouter ici des vérifications de droits (ex: seul l'admin de l'org peut modifier)
        return await this.teamRepository.updateTeam(id, data);
    }
}