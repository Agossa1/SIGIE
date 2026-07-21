import { InterventionsRepository } from '../repositories/interventions.repository';

export class InterventionsExportService {
    constructor(private readonly repository: InterventionsRepository) {}

    async exportCSV(filters?: {
        municipalityId?: string;
        dateFrom?: string;
        dateTo?: string;
        status?: string;
    }): Promise<string> {
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