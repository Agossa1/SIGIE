"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportController = void 0;
const zod_1 = require("zod");
const update_validations_1 = require("../validations/update.validations");
const appErrors_1 = require("../../../shared/errors/appErrors");
const updateReportController = (updateService) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            // Validation Zod du statut
            const { status } = update_validations_1.updateReportStatusSchema.parse(req.body);
            await updateService.executeStatusUpdate(id, status);
            res.status(200).json({
                success: true,
                message: 'Statut du rapport mis à jour avec succès.',
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return next(new appErrors_1.ValidationError('Statut invalide', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
exports.updateReportController = updateReportController;
//# sourceMappingURL=update.controller.js.map