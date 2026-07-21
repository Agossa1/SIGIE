"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsStatsController = void 0;
class GetInterventionsStatsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { municipalityId, dateFrom, dateTo } = req.query;
                const stats = await this.service.getStats({
                    municipalityId: municipalityId,
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                });
                res.json({ success: true, data: stats });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetInterventionsStatsController = GetInterventionsStatsController;
//# sourceMappingURL=stats.controller.js.map