"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsByMissionController = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
/** Regex simple pour valider un UUID v4. */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * GetInterventionsByMissionController
 *
 * Valide le format du missionId avant d'interroger la base.
 * Retourne la liste des interventions au format normalisé.
 */
class GetInterventionsByMissionController {
    constructor(repo) {
        this.repo = repo;
        this.handle = async (req, res, next) => {
            try {
                const missionId = String(req.params.missionId || '');
                if (!UUID_REGEX.test(missionId)) {
                    throw new appErrors_1.BadRequestError(`Le paramètre "missionId" doit être un UUID valide (reçu : "${missionId}").`);
                }
                const interventions = await this.repo.getByMissionId(missionId);
                res.json({ success: true, data: interventions });
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.GetInterventionsByMissionController = GetInterventionsByMissionController;
//# sourceMappingURL=get-by-mission.controller.js.map