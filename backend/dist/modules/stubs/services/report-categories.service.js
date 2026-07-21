"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportCategoriesService = void 0;
class GetReportCategoriesService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() { return this.repository.getReportCategories(); }
}
exports.GetReportCategoriesService = GetReportCategoriesService;
//# sourceMappingURL=report-categories.service.js.map