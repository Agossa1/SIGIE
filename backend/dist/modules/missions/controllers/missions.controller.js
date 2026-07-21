"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMissionReportController = exports.assignMissionController = exports.updateMissionStatusController = exports.updateMissionController = exports.getMissionByIdController = void 0;
const zod_1 = require("zod");
const appErrors_1 = require("../../../shared/errors/appErrors");
const missions_validations_1 = require("../validations/missions.validations");
const getMissionByIdController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
            const mission = await service.execute(id);
            res.status(200).json({ success: true, data: mission, message: 'Détails de la mission' });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('ID de mission invalide', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.getMissionByIdController = getMissionByIdController;
const updateMissionController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
            const validated = missions_validations_1.updateMissionSchema.parse(req.body);
            await service.executeUpdate(id, validated);
            res.status(200).json({ success: true, data: null, message: 'Mission mise à jour' });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('Données de mise à jour invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.updateMissionController = updateMissionController;
const updateMissionStatusController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
            const { status } = missions_validations_1.updateMissionStatusSchema.parse(req.body);
            const user = req.user;
            if (!user || !user.id) {
                throw new appErrors_1.UnauthorizedError('Utilisateur non authentifié');
            }
            const userId = user.id;
            await service.executeStatus(id, status, userId);
            res.status(200).json({ success: true, data: null, message: 'Statut de la mission mis à jour' });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('Statut de mission invalide', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.updateMissionStatusController = updateMissionStatusController;
const assignMissionController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
            const validated = missions_validations_1.assignMissionSchema.parse(req.body);
            await service.execute(id, validated);
            res.status(200).json({ success: true, data: null, message: 'Utilisateurs assignés à la mission' });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('Données d\'assignation invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.assignMissionController = assignMissionController;
const addMissionReportController = (service) => {
    return async (req, res, next) => {
        try {
            const { id } = missions_validations_1.missionIdParamSchema.parse(req.params);
            const validated = missions_validations_1.createMissionReportSchema.parse(req.body);
            const user = req.user;
            if (!user || !user.id) {
                throw new appErrors_1.UnauthorizedError('Utilisateur non authentifié');
            }
            const userId = user.id;
            await service.execute(id, userId, validated);
            res.status(201).json({ success: true, data: null, message: 'Rapport ajouté avec succès' });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('Données de rapport invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.addMissionReportController = addMissionReportController;
//# sourceMappingURL=missions.controller.js.map