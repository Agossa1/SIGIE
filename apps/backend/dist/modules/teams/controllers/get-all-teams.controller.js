"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllTeamsController = void 0;
const team_mapper_1 = require("../mappers/team.mapper");
class GetAllTeamsController {
    constructor(getTeamsService) {
        this.getTeamsService = getTeamsService;
        this.handle = async (req, res, next) => {
            try {
                const orgId = req.user?.organizationId;
                // Si pas d'orgId (ex: Super Admin ou utilisateur non assigné), 
                // on retourne un tableau vide plutôt que de crasher l'app avec une 400
                if (!orgId) {
                    return res.json({ success: true, data: [] });
                }
                const teams = await this.getTeamsService.execute(orgId);
                return res.json({
                    success: true,
                    data: teams.map(team => team_mapper_1.TeamMapper.toDTO(team))
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetAllTeamsController = GetAllTeamsController;
//# sourceMappingURL=get-all-teams.controller.js.map