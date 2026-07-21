"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNeighborhoodsController = void 0;
class GetNeighborhoodsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res) => {
            try {
                const rows = await this.service.execute(req.query.districtId);
                res.json({ success: true, data: rows });
            }
            catch (e) {
                res.status(500).json({ success: false, message: e.message });
            }
        };
    }
}
exports.GetNeighborhoodsController = GetNeighborhoodsController;
//# sourceMappingURL=get-neighborhoods.controller.js.map