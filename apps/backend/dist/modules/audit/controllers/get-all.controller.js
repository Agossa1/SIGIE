"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllAuditLogsController = void 0;
class GetAllAuditLogsController {
    constructor(service) {
        this.service = service;
        this.handle = async (req, res, next) => {
            try {
                const { userId, action, tableName, from, to, page = '1', limit = '50' } = req.query;
                const result = await this.service.execute({
                    userId: userId,
                    action: action,
                    tableName: tableName,
                    from: from,
                    to: to,
                }, parseInt(page), parseInt(limit));
                res.json({ success: true, ...result });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetAllAuditLogsController = GetAllAuditLogsController;
//# sourceMappingURL=get-all.controller.js.map