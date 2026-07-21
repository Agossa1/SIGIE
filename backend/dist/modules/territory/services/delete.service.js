"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTerritoryService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteTerritoryService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    async execute(id, organizationId) {
        const existingMunicipality = await this.territoryRepository.getMunicipalityById(id);
        if (!existingMunicipality) {
            throw new appErrors_1.NotFoundError(`Municipalité avec l'ID ${id} non trouvée.`);
        }
        await this.territoryRepository.deleteMunicipality(id);
        this.logger.info(`Municipalité ${id} supprimée.`);
    }
}
exports.DeleteTerritoryService = DeleteTerritoryService;
//# sourceMappingURL=delete.service.js.map