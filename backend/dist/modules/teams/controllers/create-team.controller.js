"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTeamController = void 0;
const team_mapper_1 = require("../mappers/team.mapper");
const zod_1 = require("zod");
const createTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Le nom doit avoir au moins 3 caractères"),
    municipalityId: zod_1.z.string().uuid().optional(),
    teamType: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    supervisorId: zod_1.z.string().uuid().optional(),
    memberIds: zod_1.z.array(zod_1.z.string().uuid()).optional()
});
class CreateTeamController {
    constructor(createTeamService) {
        this.createTeamService = createTeamService;
        this.handle = async (req, res, next) => {
            try {
                const validatedData = createTeamSchema.parse(req.body);
                const orgId = req.user?.organizationId;
                const team = await this.createTeamService.execute({
                    ...validatedData,
                    orgId: orgId
                });
                return res.status(201).json({
                    success: true,
                    message: 'Brigade créée avec succès',
                    data: team_mapper_1.TeamMapper.toDTO(team)
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CreateTeamController = CreateTeamController;
//# sourceMappingURL=create-team.controller.js.map