"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInfrastructureController = void 0;
class DeleteInfrastructureController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                await this.service.execute(req.params.id);
                res.json({ success: true, message: 'Ouvrage supprimé' });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.DeleteInfrastructureController = DeleteInfrastructureController;
//# sourceMappingURL=delete.controller.js.map