"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllInterventionsController = void 0;
class GetAllInterventionsController {
    constructor(repo) {
        this.repo = repo;
        this.handle = async (_req, res, next) => {
            try {
                res.json({ success: true, data: await this.repo.getAll() });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetAllInterventionsController = GetAllInterventionsController;
//# sourceMappingURL=get-all.controller.js.map