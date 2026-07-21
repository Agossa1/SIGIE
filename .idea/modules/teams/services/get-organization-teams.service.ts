import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repository';
import { Team } from '../types/teams.types';

export class GetOrganizationTeamsService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly logger: Logger
    ) {}

    /**
     * Récupère toutes les équipes actives d'une organisation
     */
    public async execute(orgId: string): Promise<Team[]> {
        this.logger.info(`Récupération des brigades pour l'organisation : ${orgId}`);
        return await this.teamRepository.findByOrganization(orgId);
    }

    public async executePaginated(
        orgId: string, 
        page: number, 
        limit: number, 
        search?: string
    ): Promise<{ data: Team[], total: number }> {
        this.logger.info(`Récupération paginée des brigades pour l'organisation : ${orgId}`);
        return await this.teamRepository.findPaginatedByOrganization(orgId, page, limit, search);
    }
}