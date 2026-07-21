"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportByIdController = exports.getReportsController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const getReportsController = (getService) => {
    return async (req, res, next) => {
        try {
            const reports = await getService.execute();
            res.status(200).json({
                success: true,
                data: reports,
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getReportsController = getReportsController;
const getReportByIdController = (getService) => {
    return async (req, res, next) => {
        try {
            const id = req.params.id;
            const report = await getService.executeById(id);
            if (!report) {
                throw new appErrors_1.NotFoundError(`Rapport avec l'identifiant ${id} introuvable.`);
            }
            res.status(200).json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.getReportByIdController = getReportByIdController;
//# sourceMappingURL=get.controller.js.map