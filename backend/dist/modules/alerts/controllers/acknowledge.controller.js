"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcknowledgeAlertController = void 0;
class AcknowledgeAlertController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, message: 'Non authentifié' });
                const alertId = String(req.params.id);
                const alert = await this.service.execute(alertId, userId);
                if (!alert)
                    return res.status(404).json({ success: false, message: 'Alerte introuvable' });
                res.json({ success: true, data: alert });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.AcknowledgeAlertController = AcknowledgeAlertController;
//# sourceMappingURL=acknowledge.controller.js.map