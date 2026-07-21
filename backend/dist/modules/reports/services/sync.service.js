"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncReportsService = void 0;
class SyncReportsService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Reçoit un lot de rapports créés hors connexion et les insère séquentiellement.
     * Pour chaque rapport, s'il échoue, l'erreur est capturée mais n'empêche pas
     * l'insertion des autres rapports.
     */
    async executeBulk(reports, userId) {
        const result = {
            successful: 0,
            failed: 0,
            errors: []
        };
        for (let i = 0; i < reports.length; i++) {
            const report = reports[i];
            try {
                // Ensure the createdBy is attached accurately from token
                const dto = {
                    ...report,
                    createdBy: userId
                };
                await this.repository.createReport(dto);
                result.successful++;
            }
            catch (error) {
                result.failed++;
                result.errors.push({
                    index: i,
                    title: report.title || 'Untitled',
                    reason: error.message || 'Unknown error'
                });
            }
        }
        return result;
    }
}
exports.SyncReportsService = SyncReportsService;
//# sourceMappingURL=sync.service.js.map