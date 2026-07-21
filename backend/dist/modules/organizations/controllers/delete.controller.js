"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOrganizationController = void 0;
class DeleteOrganizationController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                await this.service.execute(String(req.params.id));
                res.json({ success: true, message: 'Organisation supprimée' });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.DeleteOrganizationController = DeleteOrganizationController;
//# sourceMappingURL=delete.controller.js.map