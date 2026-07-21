"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationByIdController = void 0;
class GetOrganizationByIdController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const org = await this.service.execute(String(req.params.id));
                res.json({ success: true, data: org });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetOrganizationByIdController = GetOrganizationByIdController;
//# sourceMappingURL=get-by-id.controller.js.map