import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError, BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';
import { UpdateMunicipalityDTO } from '../types/territory.types';
import type { Logger } from 'winston';

export class UpdateTerritoryService {
    constructor(
        private readonly territoryRepository: TerritoryRepository,
        private readonly logger: Logger
    ) { }

    public async updateMunicipality(id: string, dto: UpdateMunicipalityDTO): Promise<void> {
        const existingMunicipality = await this.territoryRepository.getMunicipalityById(id);
        if (!existingMunicipality) {
            throw new NotFoundError(`Municipalité avec l'ID ${id} non trouvée.`);
        }

        await this.territoryRepository.updateMunicipality(id, dto);
        this.logger.info(`Municipalité ${id} mise à jour.`);
    }

    // Ajoutez des méthodes similaires pour updateDistrict, updateNeighborhood, etc.
}