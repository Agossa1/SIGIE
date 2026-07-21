import { z } from 'zod';
import { MissionStatus, MissionType, PriorityLevel } from '../types/missions.types';

export const missionIdParamSchema = z.object({
    id: z.string().uuid({ message: "L'ID de la mission doit être un UUID valide" }),
});

export const createMissionSchema = z.object({
    title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
    description: z.string().optional(),
    missionType: z.nativeEnum(MissionType, { message: "Type de mission invalide" }),
    priorityLevel: z.nativeEnum(PriorityLevel, { message: "Niveau de priorité invalide" }),
    municipalityId: z.string().uuid().optional(),
    assignedTeamId: z.string().uuid().optional(),
    scheduledAt: z.string().datetime().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    reportId: z.string().uuid().optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive().optional(),
});

export const updateMissionSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    missionType: z.nativeEnum(MissionType).optional(),
    priorityLevel: z.nativeEnum(PriorityLevel).optional(),
    municipalityId: z.string().uuid().optional(),
    assignedTeamId: z.string().uuid().optional(),
    scheduledAt: z.string().datetime().optional(),
    status: z.nativeEnum(MissionStatus).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().positive().optional(),
    actualHours: z.number().positive().optional(),
    reportId: z.string().uuid().optional(),
});

export const assignMissionSchema = z.object({
    userIds: z.array(z.string().uuid({ message: "Chaque ID utilisateur doit être un UUID valide" })).nonempty("La liste des utilisateurs ne peut pas être vide"),
});

export const createMissionReportSchema = z.object({
    report: z.string().min(10, "Le rapport doit faire au moins 10 caractères"),
    completionPercentage: z.number().min(0).max(100).optional(),
    photos: z.array(z.string().url()).optional(),
});

export const updateMissionStatusSchema = z.object({
    status: z.nativeEnum(MissionStatus, { message: "Statut de mission invalide" }),
    forceCompleteInterventions: z.boolean().optional(),
});
