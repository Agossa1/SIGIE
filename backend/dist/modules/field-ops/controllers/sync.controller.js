"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncReportsController = void 0;
const create_validations_1 = require("../validations/create.validations");
const zod_1 = require("zod");
const syncReportsController = (syncService) => {
    return async (req, res, next) => {
        try {
            const { reports } = req.body;
            if (!Array.isArray(reports)) {
                return res.status(400).json({ error: 'Expected an array of reports in the body under the key "reports".' });
            }
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized.' });
            }
            // Optional: You could validate the array via Zod, but validating per-item in loop is better
            // to show exactly which fails validation without halting all.
            const validReports = [];
            const validationErrors = [];
            for (let i = 0; i < reports.length; i++) {
                try {
                    const parsed = create_validations_1.createReportSchema.parse(reports[i]);
                    validReports.push(parsed);
                }
                catch (err) {
                    if (err instanceof zod_1.ZodError) {
                        validationErrors.push({
                            index: i,
                            title: reports[i].title || 'Untitled',
                            reason: err.flatten().fieldErrors
                        });
                    }
                }
            }
            // Lancer le service sur les rapports valides de façon isolée
            const syncResult = await syncService.executeBulk(validReports, userId);
            res.status(200).json({
                success: true,
                message: 'Synchronisation par lot traitée.',
                data: {
                    processed: validReports.length,
                    successful: syncResult.successful,
                    failedToInsert: syncResult.failed,
                    dbErrors: syncResult.errors,
                    validationErrors: validationErrors
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.syncReportsController = syncReportsController;
//# sourceMappingURL=sync.controller.js.map