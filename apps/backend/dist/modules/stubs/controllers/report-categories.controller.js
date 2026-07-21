"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportCategoriesController = void 0;
class GetReportCategoriesController {
    constructor(service) {
        this.service = service;
        this.handle = async (_req, res, next) => {
            try {
                const categories = await this.service.execute();
                res.json({ success: true, data: categories });
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.GetReportCategoriesController = GetReportCategoriesController;
//# sourceMappingURL=report-categories.controller.js.map