"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportSchema = void 0;
const zod_1 = require("zod");
const field_ops_types_1 = require("../types/field-ops.types");
// ── Schémas des détails spécialisés ───────────────────────────────────────────
const drainageDetailsSchema = zod_1.z.object({
    blockageLevelPct: zod_1.z.number().min(0).max(100, 'Le pourcentage de blocage doit être entre 0 et 100'),
    waterLevelCm: zod_1.z.number().min(0, 'La hauteur d\'eau ne peut pas être négative'),
    flowStatus: zod_1.z.string().min(1, 'Le statut du flux est requis'),
});
const roadDetailsSchema = zod_1.z.object({
    damageSurfaceM2: zod_1.z.number().min(0, 'La surface endommagée ne peut pas être négative'),
    potholeDepthCm: zod_1.z.number().min(0, 'La profondeur ne peut pas être négative'),
});
const wasteDetailsSchema = zod_1.z.object({
    estimatedVolumeM3: zod_1.z.number().min(0, 'Le volume ne peut pas être négatif'),
    wasteType: zod_1.z.string().min(1, 'Le type de déchets est requis'),
});
// ── Schéma principal de création ──────────────────────────────────────────────
exports.createReportSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, 'Le titre doit comporter au moins 3 caractères')
        .max(255, 'Le titre ne peut pas dépasser 255 caractères'),
    description: zod_1.z.string().max(5000, 'La description ne peut pas dépasser 5000 caractères').optional(),
    issueCategory: zod_1.z.nativeEnum(field_ops_types_1.IssueCategory, {
        message: 'Catégorie de problème invalide'
    }),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
    riskLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
    country: zod_1.z.string().min(2, 'Le pays est requis'),
    city: zod_1.z.string().min(2, 'La ville est requise'),
    district: zod_1.z.string().min(2, 'L\'arrondissement est requis'),
    neighborhoodId: zod_1.z.string().uuid('ID de quartier invalide').optional(),
    customNeighborhoodName: zod_1.z.string().min(2, 'Le nom personnalisé doit faire au moins 2 caractères').optional(),
    latitude: zod_1.z.number().min(-90).max(90, 'Latitude invalide'),
    longitude: zod_1.z.number().min(-180).max(180, 'Longitude invalide'),
    infrastructureId: zod_1.z.string().uuid('ID d\'infrastructure invalide').optional(),
    mappedAreaId: zod_1.z.string().uuid('ID de zone cartographiée invalide').optional(),
    drainageDetails: drainageDetailsSchema.optional(),
    roadDetails: roadDetailsSchema.optional(),
    wasteDetails: wasteDetailsSchema.optional(),
}).superRefine((data, ctx) => {
    // Validation croisée : les détails doivent correspondre à la catégorie
    if (data.issueCategory === field_ops_types_1.IssueCategory.DRAINAGE && !data.drainageDetails) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Les détails de drainage sont requis pour cette catégorie',
            path: ['drainageDetails'],
        });
    }
    if (data.issueCategory === field_ops_types_1.IssueCategory.ROAD && !data.roadDetails) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Les détails de voirie sont requis pour cette catégorie',
            path: ['roadDetails'],
        });
    }
    if (data.issueCategory === field_ops_types_1.IssueCategory.WASTE && !data.wasteDetails) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Les détails déchets sont requis pour cette catégorie',
            path: ['wasteDetails'],
        });
    }
    // Validation du quartier manuel vs UUID
    if (!data.neighborhoodId && !data.customNeighborhoodName) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: 'Vous devez soit sélectionner un quartier existant, soit saisir son nom manuellement',
            path: ['neighborhoodId'],
        });
    }
});
//# sourceMappingURL=create.validations.js.map