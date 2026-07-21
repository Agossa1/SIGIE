import { MissionsRepository } from '../repositories/missions.repository';
import { CreateMissionDTO } from '../types/missions.types';
import { BadRequestError } from '../../../shared/errors/appErrors';

export class CreateMissionService {
    constructor(private readonly repository: MissionsRepository) { }

    async execute(dto: CreateMissionDTO, userId: string): Promise<string> {
        // Validation optionnelle : si une équipe est spécifiée, vérifier qu'elle existe
        if (dto.assignedTeamId) {
            const teamExists = await this.repository.checkTeamExists(dto.assignedTeamId);
            if (!teamExists) {
                throw new BadRequestError(`L'équipe assignée (ID: ${dto.assignedTeamId}) n'existe pas.`);
            }
        }

        return this.repository.createMission({
            ...dto,
            createdBy: userId
        });
    }
}
