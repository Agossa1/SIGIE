import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repository';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { Team } from '../types/teams.types';

export interface CreateTeamDTO {
    name: string;
    orgId: string;
    municipalityId?: string;
    teamType?: string;
    description?: string;
    supervisorId?: string;
    memberIds?: string[];
}

export class CreateNewBrigadeService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly logger: Logger
    ) {}

    public async execute(data: CreateTeamDTO): Promise<Team> {
        if (data.name.length < 3) {
            throw new BadRequestError('Le nom de la brigade est trop court');
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