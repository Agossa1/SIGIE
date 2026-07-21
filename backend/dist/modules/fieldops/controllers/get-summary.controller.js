"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFieldOpsSummaryController = void 0;
class GetFieldOpsSummaryController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const user = req.user;
                const summary = await this.service.execute(user);
                res.json({ success: true, data: summary });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetFieldOpsSummaryController = GetFieldOpsSummaryController;
//# sourceMappingURL=get-summary.controller.js.map