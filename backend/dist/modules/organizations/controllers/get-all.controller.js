"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllOrganizationsController = void 0;
class GetAllOrganizationsController {
    constructor(service) {
        this.service = service;
        this.handle = async (_req, res, next) => {
            try {
                res.json({ success: true, data: await this.service.execute() });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetAllOrganizationsController = GetAllOrganizationsController;
//# sourceMappingURL=get-all.controller.js.map