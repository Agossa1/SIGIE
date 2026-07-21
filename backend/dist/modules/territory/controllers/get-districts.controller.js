"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDistrictsController = void 0;
class GetDistrictsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res) => {
            try {
                const rows = await this.service.execute(req.query.municipalityId);
                res.json({ success: true, data: rows });
            }
            catch (e) {
                res.status(500).json({ success: false, message: e.message });
            }
        };
    }
}
exports.GetDistrictsController = GetDistrictsController;
//# sourceMappingURL=get-districts.controller.js.map