import { MissionsRepository } from '../repositories/missions.repository';
import { CreateMissionDTO } from '../types/missions.types';
import { AppError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class CreateMissionService {
    constructor(private readonly repository: MissionsRepository) { }

    async execute(dto: CreateMissionDTO, userId: string): Promise<string> {
        // 1. Validation de la présence de l'identifiant
        if (!dto.assignedTeamId) {
            throw new AppError("L'ID de l'équipe assignée est obligatoire.", 400);
        }

        // 2. Vérification sécurisée dans le dépôt
        const teamExists = await this.repository.checkTeamExists(dto.assignedTeamId);
        if (!teamExists) {
            throw new AppError(`L'équipe assignée (ID: ${dto.assignedTeamId}) n'existe pas.`, 400);
        }

        return this.repository.createMission({
            ...dto,
            createdBy: userId
        });
    }
}
