"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInterventionController = void 0;
/**
 * CreateInterventionController
 *
 * Responsabilité unique : extraire les paramètres HTTP, déléguer au service,
 * retourner la réponse HTTP normalisée.
 * Toute validation métier est dans InterventionsService.
 */
class CreateInterventionController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { missionId, interventionType } = req.body;
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié.' } });
                    return;
                }
                const intervention = await this.service.create({ missionId, interventionType, userId });
                res.status(201).json({ success: true, data: intervention });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.CreateInterventionController = CreateInterventionController;
//# sourceMappingURL=create.controller.js.map