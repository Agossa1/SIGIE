"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryService = void 0;
const redis_service_1 = require("../../../config/redis/redis.service");
class GetTerritoryService {
    constructor(repository) {
        this.repository = repository;
    }
    async getRegions() {
        const cacheKey = 'territory:regions:all';
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached)
            return cached;
        const regions = await this.repository.getRegions();
        await redis_service_1.redisService.set(cacheKey, regions, 3600);
        return regions;
    }
    async getMunicipalitiesByRegion(regionId) {
        const cacheKey = `territory:municipalities:region:${regionId}`;
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached)
            return cached;
        const municipalities = await this.repository.getMunicipalitiesByRegion(regionId);
        await redis_service_1.redisService.set(cacheKey, municipalities, 3600);
        return municipalities;
    }
    async getDistrictsByMunicipality(municipalityId) {
        const cacheKey = `territory:districts:municipality:${municipalityId}`;
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached)
            return cached;
        const districts = await this.repository.getDistrictsByMunicipality(municipalityId);
        await redis_service_1.redisService.set(cacheKey, districts, 3600);
        return districts;
    }
    async getNeighborhoodsByDistrict(districtId) {
        const cacheKey = `territory:neighborhoods:district:${districtId}`;
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached)
            return cached;
        const neighborhoods = await this.repository.getNeighborhoodsByDistrict(districtId);
        await redis_service_1.redisService.set(cacheKey, neighborhoods, 3600);
        return neighborhoods;
    }
    async getMunicipalities() {
        const cacheKey = 'territory:municipalities:all';
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const municipalities = await this.repository.getMunicipalities();
        await redis_service_1.redisService.set(cacheKey, municipalities, 3600); // Cache 1h
        return municipalities;
    }
    async getHierarchy(organizationId, userId) {
        const cacheKey = `territory:hierarchy:${organizationId ?? 'all'}:${userId}`;
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached) {
            return cached;
        }
        // 1. Récupérer les informations territoriales de l'utilisateur
        const user = await this.repository.getUserTerritoryInfo(userId);
        const roles = user.roles || [];
        // 2. Récupérer toute la hiérarchie brute (filtrée par org si disponible)
        let flatHierarchy = await this.repository.getFullTerritoryHierarchy(organizationId);
        // 3. Filtrer en fonction du rôle (SuperAdmin et Ministère ont TOUT)
        const isSuperUser = roles.includes('super_admin') || roles.includes('platform_admin') || roles.includes('ministry');
        if (!isSuperUser) {
            if (user.districtId) {
                // Chef d'Arrondissement -> Ne voit que son arrondissement
                flatHierarchy = flatHierarchy.filter(row => row.districtId === user.districtId);
            }
            else if (user.municipalityId) {
                // Maire -> Ne voit que sa commune
                flatHierarchy = flatHierarchy.filter(row => row.municipalityId === user.municipalityId);
            }
            else if (user.regionId) {
                flatHierarchy = flatHierarchy.filter(row => row.regionId === user.regionId);
            }
            else if (user.department) {
                flatHierarchy = flatHierarchy.filter(row => (row.regionName && row.regionName.toLowerCase() === user.department.toLowerCase()) ||
                    (row.municipalityDepartment && row.municipalityDepartment.toLowerCase() === user.department.toLowerCase()));
            }
        }
        // Formater en arbre
        const tree = this.buildTree(flatHierarchy);
        await redis_service_1.redisService.set(cacheKey, tree, 3600); // Cache 1h
        return tree;
    }
    async getUserBoundary(userId) {
        const cacheKey = `territory:user-boundary:${userId}`;
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const boundary = await this.repository.getUserBoundary(userId);
        await redis_service_1.redisService.set(cacheKey, boundary, 1800); // Cache 30 min
        return boundary;
    }
    buildTree(flatData) {
        const regionsMap = new Map();
        for (const row of flatData) {
            if (!row.regionId)
                continue;
            if (!regionsMap.has(row.regionId)) {
                regionsMap.set(row.regionId, {
                    id: row.regionId,
                    name: row.regionName,
                    code: row.regionCode,
                    municipalities: new Map(),
                });
            }
            const region = regionsMap.get(row.regionId);
            if (!row.municipalityId)
                continue;
            if (!region.municipalities.has(row.municipalityId)) {
                region.municipalities.set(row.municipalityId, {
                    id: row.municipalityId,
                    name: row.municipalityName,
                    code: row.municipalityCode,
                    regionId: row.municipalityRegionId ?? row.regionId,
                    department: row.municipalityDepartment ?? row.regionName ?? null,
                    districts: new Map(),
                });
            }
            const municipality = region.municipalities.get(row.municipalityId);
            if (row.districtId) {
                if (!municipality.districts.has(row.districtId)) {
                    municipality.districts.set(row.districtId, {
                        id: row.districtId,
                        name: row.districtName,
                        code: row.districtCode,
                        neighborhoods: [],
                    });
                }
                const district = municipality.districts.get(row.districtId);
                if (row.neighborhoodId) {
                    const exists = district.neighborhoods.find((n) => n.id === row.neighborhoodId);
                    if (!exists) {
                        district.neighborhoods.push({
                            id: row.neighborhoodId,
                            name: row.neighborhoodName,
                            code: row.neighborhoodCode,
                        });
                    }
                }
            }
        }
        return Array.from(regionsMap.values()).map(region => ({
            ...region,
            municipalities: Array.from(region.municipalities.values()).map((mun) => ({
                ...mun,
                districts: Array.from(mun.districts.values()),
            })),
        }));
    }
    async reverseGeocode(longitude, latitude) {
        return this.repository.getMunicipalityByCoords(longitude, latitude);
    }
    async getGeoJson(level, options = {}) {
        const filterKey = options.regionId
            ? `region:${options.regionId}`
            : options.municipalityId
                ? `municipality:${options.municipalityId}`
                : options.districtId
                    ? `district:${options.districtId}`
                    : 'all';
        const cacheKey = `territory:geojson:${level}:${filterKey}:${options.tolerance ?? 'default'}`;
        const cached = await redis_service_1.redisService.get(cacheKey);
        if (cached)
            return cached;
        const collection = await this.repository.getGeoJsonByLevel(level, options);
        await redis_service_1.redisService.set(cacheKey, collection, 3600);
        return collection;
    }
}
exports.GetTerritoryService = GetTerritoryService;
//# sourceMappingURL=get.service.js.map