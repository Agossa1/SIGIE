"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveTeamMemberController = exports.AddTeamMemberController = exports.GetTeamMembersController = void 0;
const zod_1 = require("zod");
const addMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('userId doit être un UUID valide'),
});
/**
 * GET /teams/:id/members  — Liste les membres actuels de la brigade
 */
class GetTeamMembersController {
    constructor(teamRepository) {
        this.teamRepository = teamRepository;
        this.handle = async (req, res, next) => {
            try {
                const id = req.params.id;
                const members = await this.teamRepository.getTeamMembers(id);
                return res.json({ success: true, data: members });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetTeamMembersController = GetTeamMembersController;
/**
 * POST /teams/:id/members  — Ajoute un utilisateur à la brigade
 */
class AddTeamMemberController {
    constructor(teamRepository) {
        this.teamRepository = teamRepository;
        this.handle = async (req, res, next) => {
            try {
                const id = req.params.id;
                const { userId } = addMemberSchema.parse(req.body);
                await this.teamRepository.addMember(id, userId);
                return res.json({ success: true, message: 'Membre ajouté à la brigade' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AddTeamMemberController = AddTeamMemberController;
/**
 * DELETE /teams/:id/members/:userId  — Retire un utilisateur de la brigade
 */
class RemoveTeamMemberController {
    constructor(teamRepository) {
        this.teamRepository = teamRepository;
        this.handle = async (req, res, next) => {
            try {
                const id = req.params.id;
                const userId = req.params.userId;
                await this.teamRepository.removeMember(id, userId);
                return res.json({ success: true, message: 'Membre retiré de la brigade' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.RemoveTeamMemberController = RemoveTeamMemberController;
//# sourceMappingURL=manage-team-members.controller.js.map