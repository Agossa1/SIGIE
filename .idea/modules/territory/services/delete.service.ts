import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError } from '../../../../apps/backend/src/shared/errors/appErrors';
import type { Logger } from 'winston';

export class DeleteTerritoryService {
    constructor(
        private readonly territoryRepository: TerritoryRepository,
        private readonly logger: Logger
    ) { }

    public async execute(id: string, organizationId?: string): Promise<void> {
        const existingMunicipality = await this.territoryRepository.getMunicipalityById(id);
        if (!existingMunicipality) {
            throw new NotFoundError(`Municipalité avec l'ID ${id} non trouvée.`);
        }

        await this.territoryRepository.deleteMunicipality(id);
        this.logger.info(`Municipalité ${id} supprimée.`);
    }

    // Ajoutez des méthodes similaires pour deleteDistrict, deleteNeighborhood, etc.
}