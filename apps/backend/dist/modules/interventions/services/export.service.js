"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionsExportService = void 0;
class InterventionsExportService {
    constructor(repository) {
        this.repository = repository;
    }
    async exportCSV(filters) {
        const records = await this.repository.exportCSV(filters || {});
        const headers = ['ID', 'Type', 'Statut', 'Début', 'Fin', 'Mission', 'Commune', 'Agent'];
        const rows = records.map((row) => [
            row.id,
            (row.type || '').replace(/_/g, ' '),
            row.status || '',
            row.startedAt ? new Date(row.startedAt).toISOString() : '',
            row.endedAt ? new Date(row.endedAt).toISOString() : '',
            `"${(row.missionTitle || '').replace(/"/g, '""')}"`,
            row.municipalityName || '',
            row.agentName || '',
        ]);
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
}
exports.InterventionsExportService = InterventionsExportService;
//# sourceMappingURL=export.service.js.map