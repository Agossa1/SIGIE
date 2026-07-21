"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllTeamsController = void 0;
class GetAllTeamsController {
    constructor(service) {
        this.service = service;
        this.handle = async (_req, res, next) => {
            try {
                const teams = await this.service.execute();
                res.json({ success: true, data: teams });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetAllTeamsController = GetAllTeamsController;
//# sourceMappingURL=get-all.controller.js.map