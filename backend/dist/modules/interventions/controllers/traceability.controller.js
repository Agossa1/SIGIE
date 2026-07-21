"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTraceabilityController = void 0;
class GetTraceabilityController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const chain = await this.service.getTraceabilityByReport(req.params.reportId);
                res.json({ success: true, data: chain });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetTraceabilityController = GetTraceabilityController;
//# sourceMappingURL=traceability.controller.js.map