"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllAlertsController = void 0;
class GetAllAlertsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { type, severity, municipalityId, page, limit } = req.query;
                const alerts = await this.service.execute({
                    type: type,
                    severity: severity,
                    municipalityId: municipalityId,
                    page: page ? parseInt(page) : undefined,
                    limit: limit ? parseInt(limit) : undefined,
                });
                res.json({ success: true, data: alerts });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetAllAlertsController = GetAllAlertsController;
//# sourceMappingURL=get-all.controller.js.map