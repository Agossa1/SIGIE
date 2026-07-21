"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportSchema = void 0;
const zod_1 = require("zod");
const reports_types_1 = require("../types/reports.types");
exports.createReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Le titre doit faire au moins 5 caractères').max(255),
    description: zod_1.z.string().max(5000).optional(),
    issueCategory: zod_1.z.nativeEnum(reports_types_1.IssueCategory),
    priority: zod_1.z.nativeEnum(reports_types_1.PriorityLevel).default(reports_types_1.PriorityLevel.MEDIUM),
    riskLevel: zod_1.z.nativeEnum(reports_types_1.RiskLevel).default(reports_types_1.RiskLevel.MEDIUM),
    regionId: zod_1.z.string().uuid('Région invalide'),
    municipalityId: zod_1.z.string().uuid('Municipalité invalide'),
    districtId: zod_1.z.string().uuid('Arrondissement invalide'),
    neighborhoodId: zod_1.z.string().uuid('Quartier invalide'),
    infrastructureId: zod_1.z.string().uuid().optional(),
    mappedAreaId: zod_1.z.string().uuid().optional(),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    drainageDetails: zod_1.z.object({
        blockageLevelPct: zod_1.z.number().min(0).max(100),
        waterLevelCm: zod_1.z.number().min(0),
        flowStatus: zod_1.z.nativeEnum(reports_types_1.WaterFlowStatus),
    }).optional(),
    roadDetails: zod_1.z.object({
        damageSurfaceM2: zod_1.z.number().min(0),
        potholeDepthCm: zod_1.z.number().min(0),
    }).optional(),
    wasteDetails: zod_1.z.object({
        estimatedVolumeM3: zod_1.z.number().min(0),
        wasteType: zod_1.z.string().min(1),
    }).optional(),
    biodiversityDetails: zod_1.z.object({
        speciesName: zod_1.z.string().min(1),
        observationType: zod_1.z.string().min(1),
        count: zod_1.z.number().int().min(0).optional(),
    }).optional(),
    environmentDetails: zod_1.z.object({
        sensorId: zod_1.z.string().uuid().optional(),
        measuredValue: zod_1.z.number(),
        unit: zod_1.z.string().min(1),
    }).optional(),
    photoBase64: zod_1.z.string().optional(),
});
//# sourceMappingURL=create.validations.js.map