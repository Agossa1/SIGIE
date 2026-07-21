"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMunicipalitiesController = void 0;
class GetMunicipalitiesController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res) => {
            try {
                const rows = await this.service.execute(req.query.regionId);
                res.json({ success: true, data: rows });
            }
            catch (e) {
                res.status(500).json({ success: false, message: e.message });
            }
        };
    }
}
exports.GetMunicipalitiesController = GetMunicipalitiesController;
//# sourceMappingURL=get-municipalities.controller.js.map