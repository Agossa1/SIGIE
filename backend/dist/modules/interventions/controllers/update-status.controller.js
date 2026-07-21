"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterventionStatusController = void 0;
/**
 * UpdateInterventionStatusController
 *
 * Responsabilité unique : extraire id + status de la requête HTTP,
 * déléguer la validation et la logique au service, retourner la réponse.
 */
class UpdateInterventionStatusController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const id = req.params.id;
                const { status } = req.body;
                const intervention = await this.service.updateStatus({ id, status });
                res.json({ success: true, data: intervention });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.UpdateInterventionStatusController = UpdateInterventionStatusController;
//# sourceMappingURL=update-status.controller.js.map