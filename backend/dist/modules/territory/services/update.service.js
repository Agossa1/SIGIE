"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTerritoryService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateTerritoryService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    async updateMunicipality(id, dto) {
        const existingMunicipality = await this.territoryRepository.getMunicipalityById(id);
        if (!existingMunicipality) {
            throw new appErrors_1.NotFoundError(`Municipalité avec l'ID ${id} non trouvée.`);
        }
        await this.territoryRepository.updateMunicipality(id, dto);
        this.logger.info(`Municipalité ${id} mise à jour.`);
    }
}
exports.UpdateTerritoryService = UpdateTerritoryService;
//# sourceMappingURL=update.service.js.map