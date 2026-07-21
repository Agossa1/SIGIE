"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReportController = void 0;
const deleteReportController = (deleteService) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            await deleteService.execute(id);
            res.status(200).json({
                success: true,
                message: 'Rapport supprimé avec succès.'
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.deleteReportController = deleteReportController;
//# sourceMappingURL=delete.controller.js.map