"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInterventionReportController = exports.updateInterventionStatusController = exports.getInterventionsByTeamController = exports.getInterventionsByMissionController = exports.createInterventionController = void 0;
const createInterventionController = (service) => {
    return async (req, res, next) => {
        try {
            const dto = req.body;
            const id = await service.execute(dto);
            res.status(201).json({ success: true, data: { id }, message: 'Intervention créée avec succès' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.createInterventionController = createInterventionController;
const getInterventionsByMissionController = (service) => {
    return async (req, res, next) => {
        try {
            const missionId = req.params.missionId;
            const interventions = await service.execute(missionId);
            res.status(200).json({ success: true, data: interventions, message: 'Interventions récupérées' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getInterventionsByMissionController = getInterventionsByMissionController;
const getInterventionsByTeamController = (service) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const interventions = await service.execute(user.id, user.roles);
            res.status(200).json({ success: true, data: interventions, message: 'Interventions récupérées' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getInterventionsByTeamController = getInterventionsByTeamController;
const updateInterventionStatusController = (service) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            const dto = req.body;
            await service.execute(id, dto.status);
            res.status(200).json({ success: true, data: null, message: 'Statut de l\'intervention mis à jour' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.updateInterventionStatusController = updateInterventionStatusController;
const addInterventionReportController = (service) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            const dto = req.body;
            const userId = req.user.id;
            const reportId = await service.execute(id, userId, dto);
            res.status(201).json({ success: true, data: { id: reportId }, message: 'Rapport d\'intervention créé avec succès' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.addInterventionReportController = addInterventionReportController;
//# sourceMappingURL=interventions.controller.js.map