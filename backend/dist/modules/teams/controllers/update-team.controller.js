"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeamController = void 0;
const team_mapper_1 = require("../mappers/team.mapper");
const zod_1 = require("zod");
const updateTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).optional(),
    municipalityId: zod_1.z.string().uuid().optional(),
    teamType: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'suspended', 'disabled']).optional()
});
class UpdateTeamController {
    constructor(updateTeamService) {
        this.updateTeamService = updateTeamService;
        this.handle = async (req, res, next) => {
            try {
                const { id } = req.params;
                const validatedData = updateTeamSchema.parse(req.body);
                const team = await this.updateTeamService.execute(id, validatedData);
                return res.json({
                    success: true,
                    message: 'Brigade mise à jour avec succès',
                    data: team_mapper_1.TeamMapper.toDTO(team)
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UpdateTeamController = UpdateTeamController;
//# sourceMappingURL=update-team.controller.js.map