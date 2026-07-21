"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportInterventionsCSVController = void 0;
class ExportInterventionsCSVController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { municipalityId, dateFrom, dateTo, status } = req.query;
                const csv = await this.service.exportCSV({
                    municipalityId: municipalityId,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    status: status,
                });
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="interventions-${new Date().toISOString().split('T')[0]}.csv"`);
                res.send(csv);
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.ExportInterventionsCSVController = ExportInterventionsCSVController;
//# sourceMappingURL=export.controller.js.map