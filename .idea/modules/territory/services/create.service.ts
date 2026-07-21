import { TerritoryRepository } from '../repositories/territory.repositories';
import { CreateMunicipalityDTO } from '../types/territory.types';
import { redisService } from '../../../../apps/backend/src/config/redis/redis.service';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

export class CreateTerritoryService {
    constructor(private readonly repository: TerritoryRepository) {}

    async execute(dto: CreateMunicipalityDTO): Promise<{ id: string }> {
        // Validation basique
        if (!dto.name || !dto.code || !dto.organizationId) {
            throw new BadRequestError('Données incomplètes pour la création de la municipalité.');
        }

        // Création transactionnelle de la hiérarchie complète
        const municipalityId = await this.repository.createMunicipalityWithHierarchy(dto);

        // Invalidation du cache pour la hiérarchie territoriale
        await redisService.del(`territory:hierarchy:${dto.organizationId}`);
        await redisService.del('territory:municipalities:all');

        return { id: municipalityId };
    }
}
