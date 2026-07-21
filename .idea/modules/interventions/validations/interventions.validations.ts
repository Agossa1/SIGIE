import { z } from 'zod';
import { FieldAssignmentStatus } from '../types/interventions.types';

export const interventionIdParamSchema = z.object({
    id: z.string().uuid({ message: "L'ID de l'intervention doit être un UUID valide" }),
});

export const missionIdParamSchema = z.object({
    missionId: z.string().uuid({ message: "L'ID de la mission doit être un UUID valide" }),
});

export const createInterventionSchema = z.object({
    missionId: z.string().uuid({ message: "L'ID de la mission doit être un UUID valide" }),
    interventionType: z.string().min(2, "Le type d'intervention est requis"),
});

export const updateInterventionStatusSchema = z.object({
    status: z.nativeEnum(FieldAssignmentStatus, { message: "Statut d'intervention invalide" }),
});

export const createInterventionReportSchema = z.object({
    reportId: z.string().uuid().optional(),
    workDone: z.string().min(5, "La description du travail effectué doit faire au moins 5 caractères"),
    blockageRemovedPct: z.number().min(0).max(100).optional(),
    finalConditionScore: z.number().min(0).max(10).optional(),
    recommendations: z.string().optional(),
    completed: z.boolean().optional(),
});
