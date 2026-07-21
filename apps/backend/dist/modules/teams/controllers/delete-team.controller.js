"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTeamController = void 0;
class DeleteTeamController {
    constructor(deleteTeamService) {
        this.deleteTeamService = deleteTeamService;
        this.handle = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this.deleteTeamService.execute(id);
                return res.json({
                    success: true,
                    message: 'Brigade supprimée avec succès'
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.DeleteTeamController = DeleteTeamController;
//# sourceMappingURL=delete-team.controller.js.map