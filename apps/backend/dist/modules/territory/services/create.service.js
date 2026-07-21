"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTerritoryService = void 0;
const redis_service_1 = require("../../../config/redis/redis.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateTerritoryService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto) {
        // Validation basique
        if (!dto.name || !dto.code || !dto.organizationId) {
            throw new appErrors_1.BadRequestError('Données incomplètes pour la création de la municipalité.');
        }
        // Création transactionnelle de la hiérarchie complète
        const municipalityId = await this.repository.createMunicipalityWithHierarchy(dto);
        // Invalidation du cache pour la hiérarchie territoriale
        await redis_service_1.redisService.del(`territory:hierarchy:${dto.organizationId}`);
        await redis_service_1.redisService.del('territory:municipalities:all');
        return { id: municipalityId };
    }
}
exports.CreateTerritoryService = CreateTerritoryService;
//# sourceMappingURL=create.service.js.map