import { z } from 'zod';
import { IssueCategory, PriorityLevel, RiskLevel, WaterFlowStatus } from '../types/reports.types';

export const createReportSchema = z.object({
    title: z.string().min(5, 'Le titre doit faire au moins 5 caractères').max(255),
    description: z.string().max(5000).optional(),
    issueCategory: z.nativeEnum(IssueCategory),
    priority: z.nativeEnum(PriorityLevel).default(PriorityLevel.MEDIUM),
    riskLevel: z.nativeEnum(RiskLevel).default(RiskLevel.MEDIUM),
    regionId: z.string().uuid('Région invalide'),
    municipalityId: z.string().uuid('Municipalité invalide'),
    districtId: z.string().uuid('Arrondissement invalide'),
    neighborhoodId: z.string().uuid('Quartier invalide'),
    infrastructureId: z.string().uuid().optional(),
    mappedAreaId: z.string().uuid().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    drainageDetails: z.object({
        blockageLevelPct: z.number().min(0).max(100),
        waterLevelCm: z.number().min(0),
        flowStatus: z.nativeEnum(WaterFlowStatus),
    }).optional(),
    roadDetails: z.object({
        damageSurfaceM2: z.number().min(0),
        potholeDepthCm: z.number().min(0),
    }).optional(),
    wasteDetails: z.object({
        estimatedVolumeM3: z.number().min(0),
        wasteType: z.string().min(1),
    }).optional(),
    biodiversityDetails: z.object({
        speciesName: z.string().min(1),
        observationType: z.string().min(1),
        count: z.number().int().min(0).optional(),
    }).optional(),
    environmentDetails: z.object({
        sensorId: z.string().uuid().optional(),
        measuredValue: z.number(),
        unit: z.string().min(1),
    }).optional(),
    photoBase64: z.string().optional(),
});

export type CreateReportDTO = z.infer<typeof createReportSchema>;