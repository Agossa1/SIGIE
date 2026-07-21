"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInfrastructureController = void 0;
class GetAllInfrastructureController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { type, municipalityId, status, page = '1', limit = '20' } = req.query;
                const result = await this.service.execute({
                    type: type,
                    municipalityId: municipalityId,
                    status: status,
                }, parseInt(page), parseInt(limit));
                res.json({ success: true, ...result });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetAllInfrastructureController = GetAllInfrastructureController;
//# sourceMappingURL=get-all.controller.js.map