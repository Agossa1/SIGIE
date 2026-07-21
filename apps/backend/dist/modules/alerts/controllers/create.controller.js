"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAlertController = void 0;
const alerts_validations_1 = require("../validations/alerts.validations");
class CreateAlertController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const data = alerts_validations_1.createAlertSchema.parse(req.body);
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ success: false, message: 'Non authentifié' });
                const alert = await this.service.execute({ ...data, userId });
                res.status(201).json({ success: true, data: alert });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.CreateAlertController = CreateAlertController;
//# sourceMappingURL=create.controller.js.map