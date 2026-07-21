"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubsRepository = void 0;
const stubs_types_1 = require("../types/stubs.types");
class StubsRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getReportCategories() {
        try {
            const { rows } = await this.db.query('SELECT code, label, icon, color, description FROM report_categories WHERE is_active = TRUE ORDER BY sort_order');
            if (rows.length > 0)
                return rows;
            return stubs_types_1.DEFAULT_CATEGORIES;
        }
        catch {
            return stubs_types_1.DEFAULT_CATEGORIES;
        }
    }
}
exports.StubsRepository = StubsRepository;
//# sourceMappingURL=stubs.repository.js.map