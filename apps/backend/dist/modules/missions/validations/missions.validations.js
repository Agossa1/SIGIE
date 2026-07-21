"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMissionStatusSchema = exports.createMissionReportSchema = exports.assignMissionSchema = exports.updateMissionSchema = exports.createMissionSchema = exports.missionIdParamSchema = void 0;
const zod_1 = require("zod");
const missions_types_1 = require("../types/missions.types");
exports.missionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({ message: "L'ID de la mission doit être un UUID valide" }),
});
exports.createMissionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Le titre doit faire au moins 3 caractères"),
    description: zod_1.z.string().optional(),
    missionType: zod_1.z.nativeEnum(missions_types_1.MissionType, { message: "Type de mission invalide" }),
    priorityLevel: zod_1.z.nativeEnum(missions_types_1.PriorityLevel, { message: "Niveau de priorité invalide" }),
    municipalityId: zod_1.z.string().uuid().optional(),
    assignedTeamId: zod_1.z.string().uuid().optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    reportId: zod_1.z.string().uuid().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    estimatedHours: zod_1.z.number().positive().optional(),
});
exports.updateMissionSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().optional(),
    missionType: zod_1.z.nativeEnum(missions_types_1.MissionType).optional(),
    priorityLevel: zod_1.z.nativeEnum(missions_types_1.PriorityLevel).optional(),
    municipalityId: zod_1.z.string().uuid().optional(),
    assignedTeamId: zod_1.z.string().uuid().optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
    status: zod_1.z.nativeEnum(missions_types_1.MissionStatus).optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    estimatedHours: zod_1.z.number().positive().optional(),
    actualHours: zod_1.z.number().positive().optional(),
    reportId: zod_1.z.string().uuid().optional(),
});
exports.assignMissionSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().uuid({ message: "Chaque ID utilisateur doit être un UUID valide" })).nonempty("La liste des utilisateurs ne peut pas être vide"),
});
exports.createMissionReportSchema = zod_1.z.object({
    report: zod_1.z.string().min(10, "Le rapport doit faire au moins 10 caractères"),
    completionPercentage: zod_1.z.number().min(0).max(100).optional(),
    photos: zod_1.z.array(zod_1.z.string().url()).optional(),
});
exports.updateMissionStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(missions_types_1.MissionStatus, { message: "Statut de mission invalide" }),
    forceCompleteInterventions: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=missions.validations.js.map