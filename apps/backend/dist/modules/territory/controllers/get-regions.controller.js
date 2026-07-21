"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRegionsController = void 0;
class GetRegionsController {
    constructor(service) {
        this.service = service;
        this.handle = async (_req, res) => {
            try {
                const rows = await this.service.execute();
                res.json({ success: true, data: rows });
            }
            catch (e) {
                res.status(500).json({ success: false, message: e.message });
            }
        };
    }
}
exports.GetRegionsController = GetRegionsController;
//# sourceMappingURL=get-regions.controller.js.map