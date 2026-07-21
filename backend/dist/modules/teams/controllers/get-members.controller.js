"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamMembersController = void 0;
class GetTeamMembersController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const members = await this.service.execute(String(req.params.id));
                res.json({ success: true, data: members });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetTeamMembersController = GetTeamMembersController;
//# sourceMappingURL=get-members.controller.js.map