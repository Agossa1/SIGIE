"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizationController = exports.updateOrganizationController = exports.getOrganizationByIdController = exports.getOrganizationsController = exports.createOrganizationController = void 0;
const createOrganizationController = (service) => {
    return async (req, res, next) => {
        try {
            const dto = req.body;
            const id = await service.execute(dto);
            res.status(201).json({ success: true, data: { id }, message: 'Organisation créée avec succès' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.createOrganizationController = createOrganizationController;
const getOrganizationsController = (service) => {
    return async (req, res, next) => {
        try {
            const organizations = await service.executeAll();
            res.status(200).json({ success: true, data: organizations, message: 'Organisations récupérées' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getOrganizationsController = getOrganizationsController;
const getOrganizationByIdController = (service) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            const organization = await service.executeById(id);
            res.status(200).json({ success: true, data: organization, message: 'Détails de l\'organisation' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getOrganizationByIdController = getOrganizationByIdController;
const updateOrganizationController = (service) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            const dto = req.body;
            await service.execute(id, dto);
            res.status(200).json({ success: true, data: null, message: 'Organisation mise à jour' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.updateOrganizationController = updateOrganizationController;
const deleteOrganizationController = (service) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            await service.execute(id);
            res.status(200).json({ success: true, data: null, message: 'Organisation supprimée' });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.deleteOrganizationController = deleteOrganizationController;
//# sourceMappingURL=organizations.controller.js.map